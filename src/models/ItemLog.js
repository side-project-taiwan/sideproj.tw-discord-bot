const { Schema, model } = require("mongoose");

/**
 * ItemLog - 道具獲得/使用紀錄
 * 用於追蹤所有道具的流動情況，包括獲得和使用
 * 
 * 資料結構：
 * {
 *   userId: string,        // 用戶ID
 *   guildId: string,       // 伺服器ID
 *   itemKey: string,       // 道具鍵值（對應 MileageShopItem.key）
 *   quantity: number,      // 數量變化（正數=獲得，負數=使用）
 *   action: string,        // 動作類型
 *   source: string,        // 來源說明
 *   relatedId: string,     // 相關ID（如活動ID、購買紀錄ID等）
 *   metadata: object,      // 額外資訊
 *   timestamp: Date        // 時間戳記
 * }
 * 
 * 使用場景：
 * - 追蹤道具獲得：活動獎勵、商店購買
 * - 追蹤道具使用：升級消耗、其他用途
 * - 生成道具流動報告
 * - 檢查異常交易
 */

const ItemLogSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true, // 為查詢優化建立索引
  },
  guildId: {
    type: String,
    required: true,
    index: true,
  },
  itemKey: {
    type: String,
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v !== 0; // 數量不能為0
      },
      message: "數量變化不能為0"
    }
  },
  action: {
    type: String,
    required: true,
    enum: ["獲得", "使用", "活動獎勵", "商店購買", "升級消耗", "管理員調整"], // 允許的動作類型
  },
  source: {
    type: String,
    required: false, // 來源說明（選填）
  },
  relatedId: {
    type: String,
    required: false, // 相關的ID（如活動ID、購買紀錄ID等）
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false, // 額外的元數據（選填）
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // 為時間查詢建立索引
  },
});

// 複合索引，提升查詢效能
ItemLogSchema.index({ userId: 1, guildId: 1, timestamp: -1 });
ItemLogSchema.index({ itemKey: 1, timestamp: -1 });
ItemLogSchema.index({ action: 1, timestamp: -1 });

module.exports = model("ItemLog", ItemLogSchema);
