const Level = require("../models/Level");
const MileageShopItem = require("../models/MileageShopItem");
const MileagePurchaseLog = require("../models/MileagePurchaseLog.js");
const { addItemToInventory } = require("./inventory.service.js");
const { getOrCreateUser } = require("./level.service.js");

async function purchaseItem(userId, guildId, itemKey, isBoosting) {
  const item = await MileageShopItem.findOne({
    key: itemKey.replace("shop_", ""),
    isActive: true,
  });
  if (!item) throw new Error("該商品不存在或已下架");
  const discount = isBoosting ? 0.8 : 1;
  const finalCost = Math.floor(item.mileageCost * discount);
  const level = await getOrCreateUser(userId, guildId);
  if (!level) throw new Error("無法取得使用者資料");

  if (level.mileage < finalCost) {
    throw new Error(`里程不足，兌換 ${item.name} 需要 ${finalCost} 里程`);
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
  level.mileage -= finalCost;
  await level.save();

  // TODO: 執行給獎邏輯（依 rewardType）
  // 加入背包
  await addItemToInventory(
    userId, 
    guildId, 
    item.key, 
    1,
    "商店購買",
    `里程商店購買 - ${item.name}`,
    null,
    {
      itemName: item.name,
      mileageCost: finalCost,
      isBoosting,
      discountRate: discount,
      remainingMileage: level.mileage
    }
  );

  // 記錄購買
  const purchaseLog = await MileagePurchaseLog.create({
    userId,
    guildId,
    itemKey: item.key,
    cost: finalCost,
    createdAt: new Date(),
  });

  console.log(
    `[商店兌換] userId: ${userId} 成功購買「${item.name}」` +
      `｜消耗 ${finalCost} 里程｜剩餘 ${level.mileage} 里程`
  );

  return {
    name: item.name,
    spent: finalCost,              // 實際花費
    remainingMileage: level.mileage,
    isBoosting,
    discountRate: discount,
  };
  
}

module.exports = {
  purchaseItem,
};
