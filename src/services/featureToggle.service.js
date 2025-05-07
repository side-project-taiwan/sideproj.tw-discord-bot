const FeatureToggle = require("../models/FeatureToggle");

/**
 * 補齊 feature toggle 清單中缺少的功能（不會覆蓋已存在的）
 * @param {string[]} keys - 要檢查與建立的功能 key 陣列
 * @returns {Promise<void>}
 */
async function ensureFeatureToggles(keys = []) {
  const existing = await FeatureToggle.find({
    key: { $in: keys },
  }).then((docs) => docs.map((d) => d.key));

  const missing = keys.filter((k) => !existing.includes(k));

  if (missing.length) {
    await FeatureToggle.insertMany(
      missing.map((key) => ({
        key,
        enabled: true,
        note: "由 seed 自動建立",
      }))
    );
    console.log(`✅ 已建立缺少的功能開關: ${missing.join(", ")}`);
  } else {
    console.log("✅ 所有功能開關已存在，無需更新。");
  }
}

/**
 * 檢查某個功能是否啟用
 * @param {string} key - 功能名稱（如 mileage_shop）
 * @returns {Promise<boolean>}
 */
async function isFeatureEnabled(key) {
  const toggle = await FeatureToggle.findOne({ key });
  return toggle?.enabled ?? true;
}

module.exports = {
  ensureFeatureToggles,
  isFeatureEnabled,
};
