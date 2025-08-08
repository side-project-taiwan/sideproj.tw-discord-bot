const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { findEventById, sendRewardNotificationToChannel } = require("../../../services/activityTracker.service");
const { addItemToInventory } = require("../../../services/inventory.service");
const MileageShopItem = require("../../../models/MileageShopItem");
const {
  env: { channels },
} = require("../../../env");

module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^doSettleRewards_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }

  // 檢查活動是否已經發放過獎勵
  if (event.rewardStatus === 'distributed') {
    return interaction.reply({
      content: "❌ 此活動的獎勵已經發放過了。",
      ephemeral: true,
    });
  }

  // 檢查是否有獎勵資料
  if (!event.rewardResults || 
      (!event.rewardResults.hosts?.length && 
       !event.rewardResults.speakers?.length && 
       !event.rewardResults.participants?.length)) {
    return interaction.reply({
      content: "❌ 尚未計算獎勵資料，請先進行獎勵結算。",
      ephemeral: true,
    });
  }

  try {
    // 先立即回應用戶，避免交互超時
    await interaction.reply({
      content: "🔄 正在發放獎勵中，請稍候...",
      ephemeral: true,
    });

    let distributedCount = 0;
    let errorCount = 0;
    const distributionLog = [];

    // 獲取所有需要的道具鍵值並查詢商品名稱
    const allRewardKeys = new Set();
    event.rewardResults?.hosts?.forEach(reward => allRewardKeys.add(reward.reward));
    event.rewardResults?.speakers?.forEach(reward => allRewardKeys.add(reward.reward));
    event.rewardResults?.participants?.forEach(reward => {
      if (reward.reward && reward.reward !== "無") {
        allRewardKeys.add(reward.reward);
      }
    });

    // 從資料庫獲取道具名稱對應表
    const shopItems = await MileageShopItem.find({ key: { $in: Array.from(allRewardKeys) } });
    const itemNameMap = {};
    shopItems.forEach(item => {
      itemNameMap[item.key] = item.name;
    });

    // 準備所有獎勵發放任務
    const rewardPromises = [];

    // 準備主持人獎勵任務
    event.rewardResults.hosts.forEach(hostReward => {
      const task = async () => {
        try {
          await addItemToInventory(
            hostReward.hostId, 
            guildId, 
            hostReward.reward, 
            hostReward.quantity,
            "活動獎勵",
            `活動主持人獎勵 - ${event.topic}`,
            eventId,
            { 
              eventTopic: event.topic, 
              role: "主持人", 
              rewardType: "活動獎勵" 
            }
          );
          const itemName = itemNameMap[hostReward.reward] || hostReward.reward;
          return {
            success: true,
            log: `主持人 <@${hostReward.hostId}>: ${itemName} x${hostReward.quantity}`
          };
        } catch (error) {
          console.error(`發放主持人獎勵失敗: ${hostReward.hostId}`, error);
          return { success: false, error };
        }
      };
      rewardPromises.push(task());
    });

    // 準備分享者獎勵任務
    event.rewardResults.speakers.forEach(speakerReward => {
      const task = async () => {
        try {
          await addItemToInventory(
            speakerReward.speakerId, 
            guildId, 
            speakerReward.reward, 
            1,
            "活動獎勵",
            `活動分享者獎勵 - ${event.topic}`,
            eventId,
            { 
              eventTopic: event.topic, 
              role: "分享者", 
              rewardType: "活動獎勵" 
            }
          );
          const itemName = itemNameMap[speakerReward.reward] || speakerReward.reward;
          return {
            success: true,
            log: `分享者 <@${speakerReward.speakerId}>: ${itemName} x1`
          };
        } catch (error) {
          console.error(`發放分享者獎勵失敗: ${speakerReward.speakerId}`, error);
          return { success: false, error };
        }
      };
      rewardPromises.push(task());
    });

    // 準備參與者獎勵任務
    event.rewardResults.participants.forEach(participantReward => {
      if (participantReward.reward && participantReward.reward !== "無") {
        const task = async () => {
          try {
            await addItemToInventory(
              participantReward.participantId, 
              guildId, 
              participantReward.reward, 
              1,
              "活動獎勵",
              `活動參與者獎勵 - ${event.topic}`,
              eventId,
              { 
                eventTopic: event.topic, 
                role: "參與者", 
                rewardType: "活動獎勵" 
              }
            );
            const itemName = itemNameMap[participantReward.reward] || participantReward.reward;
            return {
              success: true,
              log: `參與者 <@${participantReward.participantId}>: ${itemName} x1`
            };
          } catch (error) {
            console.error(`發放參與者獎勵失敗: ${participantReward.participantId}`, error);
            return { success: false, error };
          }
        };
        rewardPromises.push(task());
      }
    });

    // 並行執行所有獎勵發放
    const results = await Promise.allSettled(rewardPromises);
    
    // 統計結果
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        distributedCount++;
        distributionLog.push(result.value.log);
      } else {
        errorCount++;
      }
    });

    // 更新活動狀態為已發放
    event.rewardStatus = 'distributed';
    await event.save();

    // 發送獎勵通知到活動記錄頻道
    await sendRewardNotificationToChannel(interaction.client, event, {
      distributedCount,
      errorCount,
      distributionLog,
      itemNameMap, // 傳遞已查詢的商品名稱映射表
    });

    // 建立結果 Embed
    const embed = new EmbedBuilder()
      .setTitle("🎉 獎勵發放完成")
      .setDescription(`活動「${event.topic}」的獎勵已發放完成！`)
      .setColor(0x00ff00)
      .addFields(
        {
          name: "發放統計",
          value: `✅ 成功發放: ${distributedCount} 個獎勵\n${errorCount > 0 ? `❌ 發放失敗: ${errorCount} 個獎勵` : ''}`,
          inline: false,
        }
      );

    // 如果有發放記錄，加入詳細資訊
    if (distributionLog.length > 0) {
      const logText = distributionLog.slice(0, 10).join('\n'); // 限制顯示前10個
      embed.addFields({
        name: "發放詳情",
        value: logText + (distributionLog.length > 10 ? `\n... 還有 ${distributionLog.length - 10} 個` : ''),
        inline: false,
      });
    }

    return interaction.editReply({
      content: null, // 清除之前的 "正在發放獎勵中..." 訊息
      embeds: [embed],
    });

  } catch (error) {
    console.error("獎勵發放過程中發生錯誤:", error);
    return interaction.editReply({
      content: "❌ 獎勵發放過程中發生錯誤，請稍後再試。",
      embeds: [],
    });
  }
};

