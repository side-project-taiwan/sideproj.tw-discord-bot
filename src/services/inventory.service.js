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

module.exports = { getOrCreateInventory };
