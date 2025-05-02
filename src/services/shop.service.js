const Level = require("../models/Level");
const MileageShopItem = require("../models/MileageShopItem");
const MileagePurchaseLog = require("../models/MileagePurchaseLog.js");

async function purchaseItem(userId, guildId, itemKey) {
  const item = await MileageShopItem.findOne({
    key: itemKey.replace("shop_", ""),
    isActive: true,
  });
  if (!item) throw new Error("該商品不存在或已下架");

  const level = await Level.findOne({ userId, guildId });
  if (!level) throw new Error("無法取得使用者資料");

  if (level.mileage < item.mileageCost) {
    throw new Error(
      `里程不足，兌換 ${item.name} 需要 ${item.mileageCost} 里程`
    );
  }

  // 限購邏輯（若有每日限制）
  if (item.dailyLimit > 0) {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const count = await MileagePurchaseLog.countDocuments({
      userId,
      guildId,
      itemKey: item.key,
      createdAt: { $gte: startOfToday },
    });

    if (count >= item.dailyLimit) {
      throw new Error(`你今天已達「${item.name}」的兌換上限`);
    }
  }

  // 扣除里程
  level.mileage -= item.mileageCost;
  await level.save();

  // 記錄購買
  await MileagePurchaseLog.create({
    userId,
    guildId,
    itemKey: item.key,
    cost: item.mileageCost,
    createdAt: new Date(),
  });

  // TODO: 執行給獎邏輯（依 rewardType）
  console.log(
    `[商店兌換] userId: ${userId} 成功購買「${item.name}」` +
    `｜消耗 ${item.mileageCost} 里程｜剩餘 ${level.mileage} 里程`
  );
    

  return {
    name: item.name,
    remainingMileage: level.mileage,
  };
}

module.exports = {
  purchaseItem,
};
