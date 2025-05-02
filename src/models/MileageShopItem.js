const { Schema, model } = require("mongoose");
const { RewardType } = require("../enums/mileageShop.enum");

const MileageShopItemSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true, // 兌換時對應的識別 ID（例如 shop_rare_box）
  },
  name: {
    type: String,
    required: true, // 顯示名稱（例如 ✨ 稀有寶箱）
  },
  description: {
    type: String,
    default: "",
  },
  mileageCost: {
    type: Number,
    required: true, // 價格（消耗多少里程）
  },
  isActive: {
    type: Boolean,
    default: true, // 可用狀態（方便暫時下架）
  },
  dailyLimit: {
    type: Number,
    default: 0, // 每日限購次數（0 = 不限）
  },
  rewardType: {
    type: String,
    enum: Object.values(RewardType),
    default: RewardType.CUSTOM, // 兌換後要給什麼類型的獎勵
  },
  rewardPayload: {
    type: Schema.Types.Mixed,
    default: null, // 儲存細節（例如 title 名稱、角色 ID 等）
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("MileageShopItem", MileageShopItemSchema);
