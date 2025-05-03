const _ = require("lodash");

const StreakRewardMilestone = {
  DAY_3: {
    requiredDays: 3,
    mileage: 50,
    message: "🎉 連續簽到 3 天",
  },
  DAY_7: {
    requiredDays: 7,
    mileage: 100,
    message: "🏅 連續簽到滿一週",
  },
  DAY_14: {
    requiredDays: 14,
    mileage: 150,
    message: "🌙 你堅持了雙週簽到",
  },
  DAY_30: {
    requiredDays: 30,
    mileage: 300,
    message: "📅 連續簽到滿 30 天",
  },
  DAY_50: {
    requiredDays: 50,
    mileage: 500,
    message: "💎 積沙成塔！50 天連簽",
  },
  DAY_100: {
    requiredDays: 100,
    mileage: 1000,
    message: "🎖️ 百日冒險者",
  },
  DAY_180: {
    requiredDays: 180,
    mileage: 1800,
    message: "🌟 半周年冒險者",
  },
  DAY_300: {
    requiredDays: 300,
    mileage: 2500,
    message: "🔥 鐵粉玩家！300 天連簽",
  },
  DAY_365: {
    requiredDays: 365,
    mileage: 3650,
    message: "🏆 登頂傳說！365 天簽到",
  },
};

const StreakRewardByDay = _.keyBy(
  Object.values(StreakRewardMilestone),
  (entry) => entry.requiredDays
);

module.exports = { StreakRewardMilestone, StreakRewardByDay };
