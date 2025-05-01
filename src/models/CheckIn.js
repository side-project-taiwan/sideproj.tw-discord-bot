const { Schema, model } = require("mongoose");

const CheckInSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // 每位使用者只會有一筆（可配合 guildId 再做複合索引）
  },
  guildId: {
    type: String,
    required: true,
  },
  lastCheckInTime: {
    type: Date,
    default: null, // 最後簽到時間
  },
});

CheckInSchema.index({ userId: 1, guildId: 1 }, { unique: true }); // 每個群的使用者只會有一筆

module.exports = model("CheckIn", CheckInSchema);
