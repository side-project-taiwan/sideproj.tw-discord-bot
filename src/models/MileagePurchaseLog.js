const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
 *   userId: string;
 *   guildId: string;
 *   itemKey: string;
 *   cost: number;
 *   createdAt: Date;
 * }} MileagePurchaseLogDocument
 */

/**
 * 使用者登入期間記錄
 * - 用於記錄使用者進入 / 離開某些狀態（例如登入特定功能、活動區間等）
 * - 起訖時間可用於統計分析、登入行為監控等
 */
const MileagePurchaseLogSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  itemKey: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("MileagePurchaseLog", MileagePurchaseLogSchema);
