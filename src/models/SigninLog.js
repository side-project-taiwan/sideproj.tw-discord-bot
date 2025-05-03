const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
 *   userId: string;
 *   guildId: string;
 *   startTime: Date;
 *   endTime: Date;
 * }} SigninLogDocument
 */

/**
 * 使用者登入期間記錄
 * - 用於記錄使用者進入 / 離開某些狀態（例如登入特定功能、活動區間等）
 * - 起訖時間可用於統計分析、登入行為監控等
 */
const SigninLogSchema = new Schema({
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

  /** 起始時間（可對應進入某區域或功能） */
  startTime: {
    type: Date,
    default: Date.now,
  },

  /** 結束時間（可對應離開時間、結束事件等） */
  endTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("SigninLog", SigninLogSchema);
