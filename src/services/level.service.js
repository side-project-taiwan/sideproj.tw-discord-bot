const Level = require("../models/Level");

/**
 * 創建使用者初始資料
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<Level>} 新建並儲存的使用者等級物件
 */
function createUser(userId, guildId) {
  const userLevel = new Level({
    userId,
    guildId,
    xp: 0,
    activity: 0,
    mileage: 0,
    level: 0,
    spExp: 0,
    spSigninCooldown: Date.now(),
  });

  return userLevel.save(); // 回傳 Promise<Level>
}

module.exports = {
  createUser,
};
