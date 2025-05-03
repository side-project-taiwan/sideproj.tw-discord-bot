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

module.exports = {
  getOrCreateUser,
};
