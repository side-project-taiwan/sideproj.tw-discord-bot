const { Schema, model } = require("mongoose");

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
