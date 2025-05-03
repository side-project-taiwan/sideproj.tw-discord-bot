const RewardType = {
  RENAME_TOKEN: "rename_token",
  TITLE: "title",
  BOX: "box",
  ROLE: "role",
  CUSTOM: "custom",
  EXP: "exp",
};

function getIconByRewardType(type) {
  switch (type) {
    case RewardType.ROLE:
      return "🎭";
    case RewardType.TITLE:
      return "📘";
    case RewardType.EXP:
      return "🧠";
    case RewardType.CUSTOM:
      return "📦";
    default:
      return "🎁";
  }
}

module.exports = {
  RewardType,
  getIconByRewardType,
};
