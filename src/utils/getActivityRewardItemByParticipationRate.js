const rewardItemKeys = [
  "yellow_duck",
  "melon_badge",
  "memory_chip",
  "sheep_hair",
  "secret_scroll",
  "wisdom_seed",
]
module.exports = function getActivityRewardItemByParticipationRate(participationRate) {
  if (participationRate <= 0) {
    return ""; // 參與度為 0，無獎勵
  }

  // 隨機取得道具
  const randomIndex = Math.floor(Math.random() * rewardItemKeys.length);
  const selectedReward = rewardItemKeys[randomIndex];

  // 根據參與度決定是否發放獎勵
  const chance = Math.random() * 100; // 產生 0-100 的隨機數
  if (participationRate > 50 || chance <= participationRate) {
    return selectedReward; // 發放獎勵
  }

  return ""; // 未獲得獎勵
};
