const { Schema, model } = require("mongoose");

/**
 * @typedef {import('mongoose').Document & {
 *   userId: string,
 *   guildId: string,
 *   items: Array<{
 *     key: string,
 *     quantity: number
 *   }>
 * }} InventoryDocument
 */

/**
 * 玩家背包資料模型
 *
 * 每位使用者在每個 Discord 伺服器中擁有一份獨立的背包。
 * 背包使用陣列結構 items: [{ key, quantity }]，可彈性擴充道具種類。
 * 每個道具用 key 表示（對應 MileageShopItem.key），並搭配持有數量 quantity。
 *
 * 使用建議：
 * - 新增物品：若已存在則增加 quantity，否則 push 新物件。
 * - 查詢物品：可透過 'items.key' 配合 Mongo 的 $ 操作符查詢與更新。
 * - 可作為道具兌換、活動贈送、道具使用的存取依據。
 */
const InventorySchema = new Schema(
  {
    /** Discord 使用者 ID */
    userId: { type: String, required: true },

    /** 所屬伺服器（公會）ID */
    guildId: { type: String, required: true },

    /** 道具陣列清單 */
    items: [
      {
        /** 道具 key（對應 MileageShopItem.key） */
        key: { type: String, required: true },

        /** 擁有數量 */
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

/** 確保 userId + guildId 為唯一組合，一人一服僅有一份背包 */
InventorySchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = model("Inventory", InventorySchema);
