const { Schema, model } = require("mongoose");

/**
 * Discord 活動與 Google Calendar 活動的對應關係
 * 用於同步刪除、查詢等用途
 */
const CalendarEventMapSchema = new Schema(
  {
    /** Discord 活動 ID（GuildScheduledEvent.id） */
    discordEventId: {
      type: String,
      required: true,
      unique: true,
    },

    /** Google Calendar 活動 ID（event.id） */
    googleEventId: {
      type: String,
      required: true,
    },

    /** 所屬伺服器 ID（可選） */
    guildId: {
      type: String,
    },

    /** 活動標題（方便辨識） */
    title: {
      type: String,
      default: "",
    },

    /** 狀態：true 表示有效，false 表示已同步刪除或失效 */
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("CalendarEventMap", CalendarEventMapSchema);
