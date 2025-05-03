const Level = require("../models/Level");

/**
 * 創建使用者初始資料
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<Level>} 新建並儲存的使用者等級物件
 */
async function getOrCreateUser(userId, guildId) {
  /**
   * @type {Level}
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

module.exports = {
  getOrCreateUser,
};
