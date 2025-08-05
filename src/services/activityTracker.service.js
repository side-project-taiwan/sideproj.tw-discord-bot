const EventSession = require("../models/EventSession");
const { EmbedBuilder } = require("discord.js");
const {
  env: { channels },
} = require("../env");

/**
 * 建立一場活動草稿
 * @param {Object} options
 * @param {string} options.guildId
 * @param {string} options.hostId
 * @param {string} options.channelId
 * @param {Date} options.startTime
 * @param {string} options.topic
 * @param {string} [options.description]
 * @param {string[]} [options.speakerIds]
 * @returns {Promise<{ success: boolean, data?: any }>}
 */
async function createEventDraft({
  guildId,
  hostId,
  channelId,
  topic,
  description = "",
  speakerIds = [],
}) {
  try {
    const draft = await EventSession.create({
      guildId,
      hostId,
      channelId,
      topic,
      description,
      speakerIds,
      status: "draft",
    });

    return { success: true, data: draft };
  } catch (error) {
    console.error("🚨 建立活動草稿失敗:", error);
    return { success: false };
  }
}

/**
 * 找出尚未開始的活動草稿清單（依照是否有 startTime 判斷）
 * @param {string} guildId
 * @returns {Promise<EventSession[]>}
 */
async function findTodayDraftEvents(guildId) {
  return await EventSession.find({
    guildId,
    startTime: null,
    endTime: null,
  }).sort({ createdAt: 1 });
}

/**
 * 找出活動清單
 * @param {string} guildId
 * @returns {Promise<EventSession[]>}
 */
async function getEvents(guildId) {
  return await EventSession.find({
    guildId,
  }).limit(10).sort({ createdAt: -1 });
}

/**
 * 藉由id找出活動
 * @param {string} eventId
 * @returns {Promise<EventSession | null>}
 */

async function findEventById(eventId) {
  return await EventSession.findById(eventId);
}

/**
 * 找出進行中的活動
 * @param {string} guildId
 * @returns {Promise<EventSession[]>}
 */

async function findActiveEvents(guildId) {
  return await EventSession.find({
    guildId,
    status: "active",
  });
}

/**
 * 發送獎勵通知到活動記錄頻道
 * @param {import('discord.js').Client} client Discord 客戶端
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
          `🕑 **活動日期：${eventDate}**`,
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
 * 格式化台灣時間（僅日期）
 * @param {Date} date 日期物件
 * @returns {string} 格式化後的日期字串
 */
function formatTaiwanTime(date) {
  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}
module.exports = {
  createEventDraft,
  findTodayDraftEvents,
  findEventById,
  findActiveEvents,
  getEvents,
  sendRewardNotificationToChannel,
  formatTaiwanTime
};
