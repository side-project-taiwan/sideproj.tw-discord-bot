// models/FeatureToggle.js
const { Schema, model } = require("mongoose");
/**
 * @typedef {import('mongoose').Document & {
 *   key: string;
 *   enabled: boolean;
 *   note: string;
 *   createdAt: Date;
 *   updatedAt: Date;
 * }} FeatureToggleDocument
 */

/**
 * 功能開關控制模型
 *
 * 用於集中管理所有系統功能的啟用與停用狀態。
 * 例如：商店、簽到、活動系統、背包功能是否開放。
 *
 * 可搭配指令前檢查是否啟用，若關閉則回覆使用者維護中。
 *
 * 使用建議：
 * - 每個 key 對應一個功能模組。
 * - 可由管理員手動更新開關狀態（例如透過管理指令）。
 */
const FeatureToggleSchema = new Schema(
  {
    /**
     * 功能識別用 key（唯一）
     * @example "mileage_shop", "checkin_enabled", "event_feature"
     */
    key: {
      type: String,
      required: true,
      unique: true,
    },

    /**
     * 是否啟用該功能（true = 啟用，false = 關閉）
     */
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },

    /**
     * 備註說明（可顯示在後台管理或管理指令）
     * @example "正在維護中，預計下午三點恢復"
     */
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // 建立 createdAt / updatedAt 欄位
  }
);

module.exports = model("FeatureToggle", FeatureToggleSchema);
