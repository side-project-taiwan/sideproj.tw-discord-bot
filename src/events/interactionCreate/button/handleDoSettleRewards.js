const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
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

/**
 * 發送獎勵通知到活動記錄頻道
 * @param {Client} client Discord 客戶端
 * @param {EventSession} event 活動資料
 * @param {Object} rewardStats 獎勵統計資料
 */
async function sendRewardNotificationToChannel(client, event, rewardStats) {
  try {
    const activityLogChannel = client.channels.cache.get(channels.adventureLog);
    
    if (!activityLogChannel || !activityLogChannel.isTextBased()) {
      console.warn("找不到活動記錄頻道或頻道不支援文字訊息");
      return;
    }

    // 格式化活動日期
    const eventDate = event.startTime ? formatTaiwanTime(new Date(event.startTime)) : '未設定';

    // 獲取主持人和分享者的用戶資料
    const hostMentions = event.hostIds?.map(hostId => `<@${hostId}>`).join('、') || '無';
    const speakerMentions = event.speakerIds?.map(speakerId => `<@${speakerId}>`).join('、') || '無';
    
    // 統計參與者數量
    const totalParticipants = event.rewardResults?.participants?.length || 0;
    const participantsWithRewards = event.rewardResults?.participants?.filter(p => p.reward && p.reward !== "無")?.length || 0;
    
    // 統計獎勵資料
    const hostRewards = event.rewardResults?.hosts || [];
    const speakerRewards = event.rewardResults?.speakers || [];
    const participantRewards = event.rewardResults?.participants?.filter(p => p.reward && p.reward !== "無") || [];

    // 使用傳入的商品名稱映射表（避免重複查詢）
    const itemNameMap = rewardStats.itemNameMap || {};

    // 建立獎勵詳情
    const rewardDetails = [];
    
    // 主持人獎勵
    if (hostRewards.length > 0) {
      const hostRewardText = hostRewards.map(reward => {
        const itemName = itemNameMap[reward.reward] || reward.reward;
        return `🎤 主持人 <@${reward.hostId}> 獲得 **${itemName}** x${reward.quantity}`;
      }).join('\n');
      rewardDetails.push(hostRewardText);
    }
    
    // 分享者獎勵
    if (speakerRewards.length > 0) {
      const speakerRewardText = speakerRewards.map(reward => {
        const itemName = itemNameMap[reward.reward] || reward.reward;
        return `🗣️ 分享者 <@${reward.speakerId}> 獲得 **${itemName}** x1`;
      }).join('\n');
      rewardDetails.push(speakerRewardText);
    }
    
    // 參與者獎勵統計
    if (participantRewards.length > 0) {
      const rewardSummary = {};
      participantRewards.forEach(reward => {
        const itemName = itemNameMap[reward.reward] || reward.reward;
        if (!rewardSummary[itemName]) {
          rewardSummary[itemName] = 0;
        }
        rewardSummary[itemName]++;
      });
      
      const participantRewardText = Object.entries(rewardSummary)
        .map(([rewardName, count]) => `👥 ${count} 位參與者獲得 **${rewardName}**`)
        .join('\n');
      rewardDetails.push(participantRewardText);
    }

    // 建立 Embed 訊息
    const embed = new EmbedBuilder()
      .setTitle("🎉 活動獎勵發放通知")
      .setColor(0x00ff00)
      .setDescription(
        [
          `📅 **活動名稱：${event.topic}**`,
          `�️ **活動日期：${eventDate}**`,
          '',
          '🙏 **感謝各位撥空參加本次活動！**',
          '✨ **特別感謝主持人與分享者帶來精彩的分享內容！**',
          '',
          `👥 **參與者共${totalParticipants}人(${participantsWithRewards}人獲得獎勵)**`,
        ]
          .filter(Boolean)
          .join('\n')
      )
      .addFields(
        {
          name: "🎯 活動團隊",
          value: [
            `🎤 **主持人：** ${hostMentions}`,
            `🗣️ **分享者：** ${speakerMentions}`,
          ].join('\n'),
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({ text: "感謝大家的熱情參與！期待下次活動再相會 🎊" });

    // 如果有獎勵詳情，加入到 Embed
    if (rewardDetails.length > 0) {
      embed.addFields({
        name: "🏆 獎勵發放詳情",
        value: rewardDetails.join('\n\n'),
        inline: false,
      });
    }

    // 發送訊息
    await activityLogChannel.send({
      embeds: [embed],
    });

    console.log(`✅ 活動獎勵通知已發送到頻道: ${event.topic}`);
    
  } catch (error) {
    console.error("發送獎勵通知到頻道失敗:", error);
  }
}

/**
 * 格式化台灣時間
 * @param {Date} date 日期物件
 * @returns {string} 格式化後的時間字串
 */
function formatTaiwanTime(date) {
  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  return formatter.format(date);
}
