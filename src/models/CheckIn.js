const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
 *   userId: string;
 *   guildId: string;
 *   lastCheckInTime: Date;
 *   streak: number;
 * }} CheckInDocument
 */

/**
 * 簽到紀錄模型
 *
 * 每位使用者在每個 Discord 伺服器中擁有一份唯一簽到紀錄。
 * - 用來記錄最後一次簽到時間
 * - 用來追蹤連續簽到的天數 streak（連續性計算、UI 顯示、額外獎勵依據）
 */
const CheckInSchema = new Schema({
  /**
   * 使用者 ID
   */
  userId: {
    type: String,
    required: true,
  },

  /**
   * 所屬伺服器 ID
   */
  guildId: {
    type: String,
    required: true,
  },

  /**
   * 上次簽到時間（用來判斷是否可再次簽到與是否連續）
   */
  lastCheckInTime: {
    type: Date,
    default: Date.now,
  },

  /**
   * 連續簽到天數
   * - 若當日簽到與前一次簽到相差 1 天以內，則加 1
   * - 若超過 1 天未簽到，則歸零重算
   * - 用來發放連續獎勵與 UI 顯示
   */
  streak: {
    type: Number,
    default: 0,
  },
});

CheckInSchema.index({ userId: 1, guildId: 1 }, { unique: true }); // 每個群的使用者只會有一筆

module.exports = model("CheckIn", CheckInSchema);
