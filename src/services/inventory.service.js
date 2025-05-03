const Inventory = require("../models/Inventory");

/**
 * 取得或初始化玩家背包
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<import('../models/Inventory').InventoryDocument>}
 */
async function getOrCreateInventory(userId, guildId) {
  /**
   * @type {import('../models/Inventory').InventoryDocument}
   */
  let inventory = await Inventory.findOne({ userId, guildId });

  if (!inventory) {
    inventory = new Inventory({ userId, guildId, items: [] });
    await inventory.save();
  }

  return inventory;
}

/**
 * 將道具加入使用者背包（若已存在則累加數量）
 * @param {string} userId
 * @param {string} guildId
 * @param {string} key 道具識別碼
 * @param {number} quantity 新增數量
 */
async function addItemToInventory(userId, guildId, key, quantity = 1) {
  const inventory = await getOrCreateInventory(userId, guildId);

  const existing = inventory.items.find((item) => item.key === key);
  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.items.push({ key, quantity });
  }

  await inventory.save();
}

module.exports = { getOrCreateInventory, addItemToInventory };
