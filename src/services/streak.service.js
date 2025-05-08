const { StreakRewardByDay } = require("../enums/streak.enum");

/**
 * 取得下一個連續簽到獎勵資訊與提示
 * @param {number} streak - 當前連續簽到天數
 * @returns {{
 *   day: number,
 *   reward: object,
 *   daysLeft: number,
 *   hint: string
 * } | null}
 */
function getNextStreakInfo(streak) {
  const nextDay = Object.keys(StreakRewardByDay)
    .map(Number)
    .sort((a, b) => a - b)
    .find((day) => day > streak);

  if (!nextDay) return null;

  const reward = StreakRewardByDay[nextDay];
  const daysLeft = nextDay - streak;
  const hint = `\n📌 再連續簽到 **${daysLeft} 天** 可獲得「${reward.message}」獎勵 🎁`;

  return {
    day: nextDay,
    reward,
    daysLeft,
    hint,
  };
}

/**
 * 取得 streak 對應的獎勵訊息與里程
 * @param {number} streak - 當前連續天數
 * @param {boolean} isBoosting - 是否為贊助者
 * @param {number} [boostMultiplier=2] - 贊助者加乘倍率
 * @returns {{ message: string, mileage: number } | null}
 */
function getStreakRewardResult(streak, isBoosting, boostMultiplier = 2) {
  const reward = StreakRewardByDay[streak];
  if (!reward) return null;

  let mileage = reward.mileage;
  if (isBoosting) {
    mileage *= boostMultiplier;
  }

  const message = `\n\n${reward.message}，獲得 ${mileage} 里程！`;

  return { message, mileage };
}

module.exports = {
  getNextStreakInfo,
  getStreakRewardResult,
};
