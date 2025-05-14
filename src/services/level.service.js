const Level = require("../models/Level");

/**
 * 創建使用者初始資料
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<import('../models/Level').LevelDocument>} 新建或取得的使用者等級資料
 */
async function getOrCreateUser(userId, guildId) {
  /**
   * @type {import('../models/Level').LevelDocument}
   */
  let user = await Level.findOne({ userId, guildId });

  if (!user) {
    user = new Level({
      userId,
      guildId,
      xp: 0,
      activity: 0,
      mileage: 0,
      level: 0,
      spExp: 0,
      spSigninCooldown: Date.now(),
    });
    await userLevel.save();
  }

  return user;
}

/**
 * 計算升級所需的 SP 經驗值，並返回升級後的 SP 等級和剩餘經驗值。
 *
 * @param {Object} currentSpInfo 當前的 SP 等級與經驗值
 * @param {number} currentSpInfo.nowSpLevel 當前的 SP 等級
 * @param {number} currentSpInfo.nowSpExp 當前的 SP 經驗值
 * @returns {Object} 包含升級後的 SP 等級和剩餘經驗值
 * @returns {number} return.newSpLevel 升級後的 SP 等級
 * @returns {number} return.remainingExp 剩餘的 SP 經驗值
 * @returns {number} return.expChange 經驗值變化量
 * @example
 * const { newSpLevel, remainingExp } = calculateSpLevelUp({ nowSpLevel: 1, nowSpExp: 250 });
 * console.log(`新SP等級: ${newSpLevel}, 剩餘經驗值: ${remainingExp}`);
 * // 輸出: 新SP等級: 2, 剩餘經驗值: 50
 * @example
 * const { newSpLevel, remainingExp } = calculateSpLevelUp({ nowSpLevel: 2, nowSpExp: 500 });
 * console.log(`新SP等級: ${newSpLevel}, 剩餘經驗值: ${remainingExp}`);
 * // 輸出: 新SP等級: 3, 剩餘經驗值: 0
 */
function calculateSpLevelUp({nowSpLevel = 0, nowSpExp = 0}) {
  // 計算升級所需的經驗值
  let levelUpExp = (nowSpLevel + 1) * 100; // 每升一級需要100經驗值

  // 計算升級後的等級和經驗值
  let newSpLevel = nowSpLevel;
  let remainingExp = nowSpExp;

  while (remainingExp >= levelUpExp) {
    remainingExp -= levelUpExp;
    newSpLevel++;
    levelUpExp = (newSpLevel + 1) * 100; // 每升一級需要100經驗值
  }
  return { newSpLevel, remainingExp, expChange: remainingExp - nowSpExp};
}
module.exports = {
  getOrCreateUser,
  calculateSpLevelUp,
};
