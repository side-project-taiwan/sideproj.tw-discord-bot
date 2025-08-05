const { EmbedBuilder } = require("discord.js");
const { findEventById, sendRewardNotificationToChannel } = require("../../../services/activityTracker.service");
const MileageShopItem = require("../../../models/MileageShopItem");

module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^handleResendRewardMessage_/, ""); 
  
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }

  // 檢查活動是否已經發放過獎勵
  if (event.rewardStatus !== 'distributed') {
    return interaction.reply({
      content: "❌ 此活動尚未發放過獎勵，無法重發通知。",
      ephemeral: true,
    });
  }

  // 檢查是否有獎勵資料
  if (!event.rewardResults || 
      (!event.rewardResults.hosts?.length && 
       !event.rewardResults.speakers?.length && 
       !event.rewardResults.participants?.length)) {
    return interaction.reply({
      content: "❌ 沒有找到獎勵資料。",
      ephemeral: true,
    });
  }

  try {
    // 先立即回應用戶，避免交互超時
    await interaction.reply({
      content: "🔄 正在重發獎勵通知，請稍候...",
      ephemeral: true,
    });

    // 建立商品名稱映射表（用於顯示）
    const allRewardIds = new Set();
    
    // 收集所有獎勵ID
    event.rewardResults.hosts?.forEach(host => {
      if (host.reward && host.reward !== "無") {
        allRewardIds.add(host.reward);
      }
    });
    
    event.rewardResults.speakers?.forEach(speaker => {
      if (speaker.reward && speaker.reward !== "無") {
        allRewardIds.add(speaker.reward);
      }
    });
    
    event.rewardResults.participants?.forEach(participant => {
      if (participant.reward && participant.reward !== "無") {
        allRewardIds.add(participant.reward);
      }
    });

    // 查詢商品名稱
    const itemNameMap = {};
    if (allRewardIds.size > 0) {
      const items = await MileageShopItem.find({ 
        key: { $in: Array.from(allRewardIds) } 
      });
      
      items.forEach(item => {
        itemNameMap[item.key] = item.name;
      });
    }

    // 發送獎勵通知到活動記錄頻道
    await sendRewardNotificationToChannel(interaction.client, event, {
      itemNameMap, // 傳遞已查詢的商品名稱映射表
    });

    // 建立結果 Embed
    const embed = new EmbedBuilder()
      .setTitle("📢 獎勵通知重發完成")
      .setDescription(`活動「${event.topic}」的獎勵通知已重新發送到活動記錄頻道！`)
      .setColor(0x00ff00)
      .addFields(
        {
          name: "操作狀態",
          value: "✅ 通知已成功重發",
          inline: false,
        }
      );

    return interaction.editReply({
      content: null, // 清除之前的 "正在重發獎勵通知..." 訊息
      embeds: [embed],
    });

  } catch (error) {
    console.error("重發獎勵通知過程中發生錯誤:", error);
    return interaction.editReply({
      content: "❌ 重發獎勵通知過程中發生錯誤，請稍後再試。",
      embeds: [],
    });
  }
};
