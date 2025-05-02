const { Schema, model } = require("mongoose");

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
