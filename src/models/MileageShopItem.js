const { Schema, model } = require("mongoose");
const { RewardType } = require("../enums/mileageShop.enum");

/**
 * @typedef {import('mongoose').Document & {
 *   key: string;
 *   name: string;
 *   description: string;
 *   mileageCost: number;
 *   isActive: boolean;
 *   dailyLimit: number;
 *   rewardType: string;
 *   rewardPayload: any;
 *   createdAt: Date;
 * }} MileageShopItemDocument
 */

/**
 * 里程商店商品模型
 *
 * 此模型定義商店中每項可兌換道具的規格與行為，包括：
 * - 對應的道具 key 與名稱
 * - 兌換價格（mileageCost）
 * - 是否啟用（isActive）與每日限購次數（dailyLimit）
 * - 獎勵類型（rewardType）與對應 payload 資料
 *
 * 可擴充性高，可透過 rewardType 與 rewardPayload 實現稱號、角色、經驗、特殊功能等。
 */
const MileageShopItemSchema = new Schema({
  /** 兌換時對應的識別 ID（例如 shop_rare_box） */
  key: {
    type: String,
    required: true,
    unique: true,
  },

  /** 顯示名稱（例如 ✨ 稀有寶箱） */
  name: {
    type: String,
    required: true,
  },

  /** 商品描述文字（可選） */
  description: {
    type: String,
    default: "",
  },

  /** 價格（消耗多少里程） */
  mileageCost: {
    type: Number,
    required: true,
  },

  /** 商品是否啟用（可上下架用） */
  isActive: {
    type: Boolean,
    default: true,
  },

  /** 每日限購次數（0 = 不限） */
  dailyLimit: {
    type: Number,
    default: 0,
  },

  /** 獎勵類型（如 CUSTOM、ROLE、TITLE 等） */
  rewardType: {
    type: String,
    enum: Object.values(RewardType),
    default: RewardType.CUSTOM,
  },

  /** 獎勵內容（依照 rewardType 可能為物件、字串等） */
  rewardPayload: {
    type: Schema.Types.Mixed,
    default: null,
  },

  /** 商品建立時間 */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("MileageShopItem", MileageShopItemSchema);
