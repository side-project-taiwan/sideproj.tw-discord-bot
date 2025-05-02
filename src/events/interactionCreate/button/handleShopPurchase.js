// src/events/interaction/handlers/handleShopPurchase.js
const { purchaseItem } = require("../../../services/shop.service"); // 你的兌換邏輯

module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const itemKey = interaction.customId; // e.g. shop_rare_box

  try {
    const result = await purchaseItem(userId, guildId, itemKey);
    await interaction.reply({
      content: `✅ 成功兌換 ${result.name}！剩餘里程：${result.remainingMileage}`,
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: `❌ ${error.message}`,
      ephemeral: true,
    });
  }
};
