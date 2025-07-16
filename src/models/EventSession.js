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
*   status: string;
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
    hostIds: { type: [String], required: true }, // 活動主持人 ID 清單
    speakerIds: { type: [String], default: [] }, // 分享者 ID 清單
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    status: { type: String, default: 'draft' }, // 活動狀態（draft、active、ended）
    rewardStatus: { type: String, default: 'pending' }, // 獎勵發放狀態（pending: 未發放、distributed: 已發放）

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
    /** 獎勵結果 */
    rewardResults: {
      hosts: [
        {
          hostId: { type: String, required: true }, // 主持人 ID
          reward: { type: String, required: true }, // 獎勵內容
          quantity: { type: Number, required: true }, // 獎勵數量
        },
      ],
      speakers: [
        {
          speakerId: { type: String, required: true }, // 分享者 ID
          reward: { type: String, required: true }, // 獎勵內容
        },
      ],
      participants: [
        {
          participantId: { type: String, required: true }, // 參加者 ID
          reward: { type: String, required: true }, // 獎勵內容
          participationRate: { type: Number, required: true }, // 參與率
          totalMinutes: { type: Number, required: true }, // 總參與分鐘數
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = model("EventSession", EventSessionSchema);
