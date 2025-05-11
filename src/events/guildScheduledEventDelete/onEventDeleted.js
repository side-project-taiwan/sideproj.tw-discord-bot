const { Client, GuildScheduledEvent } = require("discord.js");
const {
  deleteGoogleCalendarEventByDiscordId,
} = require("../../services/googleCalendar.service");

/**
 * @param {Client} client
 * @param {GuildScheduledEvent} event
 */
module.exports = async (client, event) => {
  console.log(`🗑️ Discord 活動已刪除：${event.name}`);

  try {
    await deleteGoogleCalendarEventByDiscordId(event.id);
  } catch (err) {
    console.error("❌ Google 活動刪除失敗：", err);
  }
};
