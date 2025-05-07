const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
*   guildId: string;
*   channelId: string;
*   topic: string;
*   description: string;
*   hostId: string;
*   speakerIds: string[];
*   startTime: Date | null;
*   endTime: Date | null;
*   participants: Map<string, { join: Date; leave: Date; }[]>;
* }} EventSessionDocument
*/


/**
 * Discord 語音活動紀錄
 */
const EventSessionSchema = new Schema(
  {
    guildId: { type: String, required: true }, // 所屬伺服器
    channelId: { type: String, required: true }, // 語音頻道 ID
    topic: { type: String, required: true }, // 活動主題
    description: { type: String, required: true }, // 活動簡介
    hostId: { type: String, required: true }, // 活動發起人
    speakerIds: { type: [String], default: [] }, // 分享者 ID 清單
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },

    /** 用戶參與資料（會動態更新） */
    participants: {
      type: Map,
      of: [
        {
          join: Date,
          leave: Date,
        },
      ],
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = model("EventSession", EventSessionSchema);
