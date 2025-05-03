const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
 *   userId: string;
 *   guildId: string;
 *   expChange: number;
 *   updatedExp: number;
 *   reason?: string;
 *   timestamp: Date;
 *   signinId?: string;
 * }} SpExpChangeDocument
 */

/**
 * 特殊經驗值變化紀錄模型
 * - 記錄使用者特殊經驗（spExp）增減的來源與歷程
 * - 可用於追蹤打卡、任務、活動等對經驗的影響
 */
const SpExpChangeSchema = new Schema({
  /** 使用者 ID */
  userId: {
    type: String,
    required: true,
  },

  /** 所屬伺服器 ID */
  guildId: {
    type: String,
    required: true,
  },

  /** 本次變化的經驗值量（正負皆可能） */
  expChange: {
    type: Number,
    default: 0,
    required: true,
  },

  /** 變化後的總經驗值 */
  updatedExp: {
    type: Number,
    default: false,
  },

  /** 經驗值變化原因（例如每日簽到、任務完成等） */
  reason: {
    type: String,
  },

  /** 經驗變化時間戳記 */
  timestamp: {
    type: Date,
    default: Date.now,
  },

  /** 若來自打卡活動，可記錄關聯的簽到紀錄 ID */
  signinId: {
    type: String,
  },
});

module.exports = model("SpExpChange", SpExpChangeSchema);
