const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
const { addItemToInventory } = require("../../../services/inventory.service");

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
    let distributedCount = 0;
    let errorCount = 0;
    const distributionLog = [];

    // 發放主持人獎勵
    for (const hostReward of event.rewardResults.hosts) {
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
        distributedCount++;
        distributionLog.push(`主持人 <@${hostReward.hostId}>: ${hostReward.reward} x${hostReward.quantity}`);
      } catch (error) {
        console.error(`發放主持人獎勵失敗: ${hostReward.hostId}`, error);
        errorCount++;
      }
    }

    // 發放分享者獎勵
    for (const speakerReward of event.rewardResults.speakers) {
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
        distributedCount++;
        distributionLog.push(`分享者 <@${speakerReward.speakerId}>: ${speakerReward.reward} x1`);
      } catch (error) {
        console.error(`發放分享者獎勵失敗: ${speakerReward.speakerId}`, error);
        errorCount++;
      }
    }

    // 發放參與者獎勵
    for (const participantReward of event.rewardResults.participants) {
      if (participantReward.reward && participantReward.reward !== "無") {
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
          distributedCount++;
          distributionLog.push(`參與者 <@${participantReward.participantId}>: ${participantReward.reward} x1`);
        } catch (error) {
          console.error(`發放參與者獎勵失敗: ${participantReward.participantId}`, error);
          errorCount++;
        }
      }
    }

    // 更新活動狀態為已發放
    event.rewardStatus = 'distributed';
    await event.save();

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

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

  } catch (error) {
    console.error("獎勵發放過程中發生錯誤:", error);
    return interaction.reply({
      content: "❌ 獎勵發放過程中發生錯誤，請稍後再試。",
      ephemeral: true,
    });
  }
};
