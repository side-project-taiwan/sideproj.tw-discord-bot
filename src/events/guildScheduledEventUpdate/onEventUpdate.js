const { Client, VoiceState, GuildScheduledEventStatus } = require("discord.js");
const { channels } = require("../../../config.json");

/**
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  if (
    oldState.status !== newState.status &&
    newState.status === GuildScheduledEventStatus.Completed
  ) {
    if (newState.channelId !== channels.eventStage) {
      console.log("⛔ 結束的不是目標舞台頻道，忽略");
      return;
    }

    try {
      const targetChannel = await client.channels.fetch(
        channels.eventStageCompletedCount
      );

      if (!targetChannel?.isVoiceBased()) {
        console.log("⛔ 目標頻道不是語音頻道，忽略");
        return;
      }

      const newName = incrementStageShareCount(targetChannel.name);
      if (newName) {
        await targetChannel.setName(newName);
        console.log(`✅ 活動已結束，名稱更新為：${newName}`);
      }
    } catch (error) {
      console.error("❌ 更新頻道名稱失敗：", error);
    }
  }
};

/**
 * 專為 "📢分享累積人次：5次" 設計的計數更新函式
 * @param {string} name 頻道原始名稱
 * @returns {string|null} 回傳更新後名稱，或格式錯誤時回傳 null
 */
function incrementStageShareCount(name) {
  const match = name.match(/^📢分享累積人次：(\d+)次$/);

  if (!match) {
    console.warn("⚠️ 頻道名稱格式錯誤，應為 '📢分享累積人次：X次'");
    return null;
  }

  const currentCount = parseInt(match[1]);
  const newCount = currentCount + 1;

  return `📢分享累積人次：${newCount}次`;
}
