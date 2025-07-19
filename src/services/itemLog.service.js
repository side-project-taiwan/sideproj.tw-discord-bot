const ItemLog = require("../models/ItemLog");

/**
 * 記錄道具變化
 * @param {string} userId 用戶ID
 * @param {string} guildId 伺服器ID
 * @param {string} itemKey 道具鍵值
 * @param {number} quantity 數量變化（正數=獲得，負數=使用）
 * @param {string} action 動作類型
 * @param {string} source 來源說明（選填）
 * @param {string} relatedId 相關ID（選填）
 * @param {object} metadata 額外資訊（選填）
 * @returns {Promise<ItemLog>} 建立的紀錄
 */
async function logItemChange(userId, guildId, itemKey, quantity, action, source = null, relatedId = null, metadata = null) {
  try {
    const itemLog = new ItemLog({
      userId,
      guildId,
      itemKey,
      quantity,
      action,
      source,
      relatedId,
      metadata,
    });

    await itemLog.save();
    console.log(`📝 道具變化紀錄: 用戶${userId} ${action} ${itemKey} x${quantity}`);
    return itemLog;
  } catch (error) {
    console.error("記錄道具變化失敗:", error);
    throw error;
  }
}

/**
 * 獲取用戶的道具變化紀錄
 * @param {string} userId 用戶ID
 * @param {string} guildId 伺服器ID
 * @param {object} options 查詢選項
 * @returns {Promise<ItemLog[]>} 道具變化紀錄
 */
async function getUserItemLogs(userId, guildId, options = {}) {
  try {
    const {
      itemKey = null,
      action = null,
      limit = 50,
      skip = 0,
      sortBy = "timestamp",
      sortOrder = -1, // -1 = 降序, 1 = 升序
    } = options;

    const query = { userId, guildId };
    
    if (itemKey) query.itemKey = itemKey;
    if (action) query.action = action;

    const logs = await ItemLog.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .lean();

    return logs;
  } catch (error) {
    console.error("獲取道具變化紀錄失敗:", error);
    throw error;
  }
}

/**
 * 獲取道具的流動統計
 * @param {string} itemKey 道具鍵值
 * @param {string} guildId 伺服器ID（選填）
 * @param {Date} startDate 開始日期（選填）
 * @param {Date} endDate 結束日期（選填）
 * @returns {Promise<object>} 統計資料
 */
async function getItemFlowStats(itemKey, guildId = null, startDate = null, endDate = null) {
  try {
    const matchQuery = { itemKey };
    
    if (guildId) matchQuery.guildId = guildId;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = startDate;
      if (endDate) matchQuery.timestamp.$lte = endDate;
    }

    const stats = await ItemLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$action",
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 },
        }
      }
    ]);

    // 計算總獲得和總使用
    let totalGained = 0;
    let totalUsed = 0;
    
    stats.forEach(stat => {
      if (stat.totalQuantity > 0) {
        totalGained += stat.totalQuantity;
      } else {
        totalUsed += Math.abs(stat.totalQuantity);
      }
    });

    return {
      itemKey,
      totalGained,
      totalUsed,
      netChange: totalGained - totalUsed,
      actionBreakdown: stats,
    };
  } catch (error) {
    console.error("獲取道具流動統計失敗:", error);
    throw error;
  }
}

/**
 * 獲取用戶的道具獲得/使用統計
 * @param {string} userId 用戶ID
 * @param {string} guildId 伺服器ID
 * @param {Date} startDate 開始日期（選填）
 * @param {Date} endDate 結束日期（選填）
 * @returns {Promise<object>} 用戶統計資料
 */
async function getUserItemStats(userId, guildId, startDate = null, endDate = null) {
  try {
    const matchQuery = { userId, guildId };
    
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = startDate;
      if (endDate) matchQuery.timestamp.$lte = endDate;
    }

    const stats = await ItemLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            itemKey: "$itemKey",
            action: "$action"
          },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 },
        }
      },
      {
        $group: {
          _id: "$_id.itemKey",
          actions: {
            $push: {
              action: "$_id.action",
              totalQuantity: "$totalQuantity",
              count: "$count"
            }
          }
        }
      }
    ]);

    return stats;
  } catch (error) {
    console.error("獲取用戶道具統計失敗:", error);
    throw error;
  }
}

module.exports = {
  logItemChange,
  getUserItemLogs,
  getItemFlowStats,
  getUserItemStats,
};
