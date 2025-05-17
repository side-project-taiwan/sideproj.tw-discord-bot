const { EmbedBuilder, Client, Interaction } = require("discord.js");
const { getOrCreateUser, calculateSpLevelUp } = require("../../../services/level.service");
const { getOrCreateInventory } = require("../../../services/inventory.service");
const SpExpChange = require("../../../models/SpExpChange");
const { channels } = require("../../../../config.json");
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
    const { newSpLevel, remainingExp, cost } = calculateSpLevelUp({nowSpLevel: userLevel.spLevel, nowSpExp: userLevel.spExp});
    if(newSpLevel == userLevel.spLevel) {
      await interaction.reply({
        content: `❌ 你的經驗值不足以升級！`,
        ephemeral: true,
      });
      // userLevel.spExp += 3000;
      // await userLevel.save()
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
      expChange: -cost, //紀錄是負的代表扣除
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
    const activityLogChannel = interaction.client.channels.cache.get(
      channels.adventureLog
    );

    if (activityLogChannel) {
      const displayTime = formatTaiwanTime(new Date());
      await activityLogChannel.send(
        `${displayTime} 🎉 恭喜 <@${userId}> SP等級提升至 **${newSpLevel}** 等！`
      );
    }
  } catch (error) {
    console.log(`[handleSpLevelUp] error: ${error.message}`);

    await interaction.reply({
      content: `❌ 操作失敗，多次失敗後請聯絡管理員！`,
      ephemeral: true,
    });
  }
};

function formatTaiwanTime(date) {
  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei", // ✅ 明確指定台灣時區
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23", // ✅ 指定 24 小時制，避免出現 24:00 或上午下午
  });

  return formatter.format(date);
}