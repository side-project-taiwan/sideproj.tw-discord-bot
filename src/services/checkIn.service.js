const CheckIn = require("../models/CheckIn");

/**
 * 初始化簽到紀錄
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<CheckIn>} 新建並儲存的簽到紀錄
 */
async function initCheckIn(userId, guildId) {
  const checkIn = new CheckIn({ userId, guildId });
  return checkIn.save();
}

module.exports = {
  initCheckIn,
};
