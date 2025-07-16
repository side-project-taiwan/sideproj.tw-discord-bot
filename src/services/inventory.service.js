const Inventory = require("../models/Inventory");
const { logItemChange } = require("./itemLog.service");

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
 * @param {string} action 動作類型（預設為"獲得"）
 * @param {string} source 來源說明（選填）
 * @param {string} relatedId 相關ID（選填）
 * @param {object} metadata 額外資訊（選填）
 */
async function addItemToInventory(userId, guildId, key, quantity = 1, action = "獲得", source = null, relatedId = null, metadata = null) {
  const inventory = await getOrCreateInventory(userId, guildId);

  const existing = inventory.items.find((item) => item.key === key);
  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.items.push({ key, quantity });
  }

  await inventory.save();

  // 記錄道具變化
  try {
    await logItemChange(userId, guildId, key, quantity, action, source, relatedId, metadata);
  } catch (error) {
    console.error("記錄道具變化失敗，但不影響背包操作:", error);
  }
}

/**
 * 從使用者背包移除道具（消耗）
 * @param {string} userId
 * @param {string} guildId
 * @param {string} key 道具識別碼
 * @param {number} quantity 消耗數量
 * @param {string} action 動作類型（預設為"使用"）
 * @param {string} source 來源說明（選填）
 * @param {string} relatedId 相關ID（選填）
 * @param {object} metadata 額外資訊（選填）
 * @returns {Promise<boolean>} 是否成功消耗
 */
async function removeItemFromInventory(userId, guildId, key, quantity = 1, action = "使用", source = null, relatedId = null, metadata = null) {
  const inventory = await getOrCreateInventory(userId, guildId);

  const existing = inventory.items.find((item) => item.key === key);
  if (!existing || existing.quantity < quantity) {
    throw new Error(`道具不足: ${key} (需要: ${quantity}, 擁有: ${existing?.quantity || 0})`);
  }

  existing.quantity -= quantity;
  
  // 如果數量為0則移除該道具
  if (existing.quantity <= 0) {
    inventory.items = inventory.items.filter(item => item.key !== key);
  }

  await inventory.save();

  // 記錄道具變化（負數表示使用）
  try {
    await logItemChange(userId, guildId, key, -quantity, action, source, relatedId, metadata);
  } catch (error) {
    console.error("記錄道具變化失敗，但不影響背包操作:", error);
  }

  return true;
}

/**
 * 檢查用戶是否擁有足夠的道具
 * @param {string} userId
 * @param {string} guildId
 * @param {string} key 道具識別碼
 * @param {number} quantity 所需數量
 * @returns {Promise<boolean>} 是否擁有足夠數量
 */
async function hasEnoughItems(userId, guildId, key, quantity = 1) {
  const inventory = await getOrCreateInventory(userId, guildId);
  const existing = inventory.items.find((item) => item.key === key);
  return existing && existing.quantity >= quantity;
}

module.exports = { 
  getOrCreateInventory, 
  addItemToInventory, 
  removeItemFromInventory, 
  hasEnoughItems 
};
