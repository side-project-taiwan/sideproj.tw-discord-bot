const { Client, GuildScheduledEvent } = require("discord.js");
const {
  createGoogleCalendarEvent,
} = require("../../services/googleCalendar.service");

/**
 * @param {Client} client
 * @param {GuildScheduledEvent} event
 */
module.exports = async (client, event) => {
  const { id, guildId, name, scheduledStartTimestamp, description } = event;

  console.log(
    `🎉 偵測到新的 Discord 活動建立:\n  活動名稱: ${name}\n  開始時間: ${scheduledStartTimestamp}\n  描述: ${description}`
  );

  try {
    await createGoogleCalendarEvent({
      discordEventId: id,
      guildId,
      title: name,
      description: description || "請參考 Discord 上資訊",
      startTime: new Date(scheduledStartTimestamp).toISOString(),
      endTime: new Date(scheduledStartTimestamp + 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("❌ 建立 Google 日曆活動失敗:", err);
  }
};
