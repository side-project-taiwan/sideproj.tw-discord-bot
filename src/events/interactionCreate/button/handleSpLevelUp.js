const { EmbedBuilder, Client, Interaction } = require("discord.js");
const { getOrCreateUser, calculateSpLevelUp } = require("../../../services/level.service");
const { getOrCreateInventory } = require("../../../services/inventory.service");
const SpExpChange = require("../../../models/SpExpChange");
/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId; // e.g. spup_job_scroll

  try {
    // 取得用戶資料
    const [userLevel, inventory] = await Promise.all([
      getOrCreateUser(userId, guildId),
      getOrCreateInventory(userId, guildId),
    ]);
    // 檢查用戶是否有該物品
    const itemKey = buttonKey.replace(/^spup_/, ""); // 提取itemKey
    const item = inventory.items.find((item) => item.key === itemKey && item.quantity > 0);
    if (!item) {
      await interaction.reply({
        content: `❌ 你沒有這個物品！`,
        ephemeral: true,
      });
      return;
    }
    // 計算經驗值換算等級
    const { newSpLevel, remainingExp, expChange } = calculateSpLevelUp({nowSpLevel: userLevel.spLevel, nowSpExp: userLevel.spExp});
    console.log("inventory: ", inventory);
    console.log("itemKey: ", itemKey);
    if(newSpLevel == userLevel.spLevel) {
      await interaction.reply({
        content: `❌ 你的經驗值不足以升級！`,
        ephemeral: true,
      });
      return;
    }
    // 等級提升
    userLevel.spLevel = newSpLevel;
    userLevel.spExp = remainingExp;
    await userLevel.save();
    // 扣除物品
    item.quantity -= 1;
    if (item.quantity <= 0) {
      inventory.items = inventory.items.filter((i) => i.key !== itemKey);
    }
    await inventory.save();
    // 寫入經驗值變動紀錄
    const spExpChange = new SpExpChange({
      userId,
      guildId,
      expChange,
      updatedExp: userLevel.spExp,
      reason: "levelUp",
    });
    await spExpChange.save().catch((error) => {
      console.log(`🚨 Error saving spExpChange: ${error}`);
    });
    // 發送訊息
    const embed = new EmbedBuilder()
      .setTitle(`🚀 恭喜您升級完成！！`)
      .setColor(0x00ccff)
      .addFields(
        { name: "🎓 當前SP等級", value: `**${newSpLevel}**`, inline: false },
        {
          name: "💎 剩餘SP經驗",
          value: `${remainingExp}`,
          inline: true,
        }
      )
      .setTimestamp();
    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  } catch (error) {
    console.log(`[handleShopPurchase] error: ${error.message}`);

    await interaction.reply({
      content: `❌ 操作失敗，多次失敗後請聯絡管理員！`,
      ephemeral: true,
    });
  }
};
