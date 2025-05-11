const { google } = require("googleapis");
const path = require("node:path");
const CalendarEventMap = require("../models/CalendarEventMap");
const {
  env: { GOOGLE_CALENDAR_ID: calendarId },
} = require("../env");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

/**
 * 根據 googleEventId 刪除 Google Calendar 活動
 * @param {string} eventId
 */
async function deleteGoogleCalendarEvent(eventId) {
  await calendar.events.delete({
    calendarId,
    eventId,
  });
  console.log(`✅ Google 活動 ${eventId} 已刪除`);
}

/**
 * 將活動寫入 Google 日曆，並建立對應關係記錄
 * @param {Object} options
 * @param {string} options.discordEventId
 * @param {string} options.guildId
 * @param {string} options.title 活動標題
 * @param {string} options.description 活動說明
 * @param {string} options.startTime ISO 格式起始時間
 * @param {string} options.endTime ISO 格式結束時間
 */
async function createGoogleCalendarEvent({
  discordEventId,
  guildId,
  title,
  description,
  startTime,
  endTime,
}) {
  const event = {
    summary: title,
    description,
    start: { dateTime: startTime, timeZone: "Asia/Taipei" },
    end: { dateTime: endTime, timeZone: "Asia/Taipei" },
  };

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  const googleEventId = res.data.id;

  await CalendarEventMap.create({
    discordEventId,
    googleEventId,
    guildId,
    title,
    status: true,
  });

  console.log("✅ Google 日曆活動建立成功:", title);
}

/**
 * 從 discord event id 找到 google 活動 id 並刪除
 * 僅將 status 設為 false，保留紀錄
 */
async function deleteGoogleCalendarEventByDiscordId(discordEventId) {
  const map = await CalendarEventMap.findOne({ discordEventId });
  if (!map) throw new Error("找不到對應的 Google 活動");

  await deleteGoogleCalendarEvent(map.googleEventId);
  map.status = false;
  await map.save();
}

module.exports = {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEventByDiscordId,
};
