const { purchaseItem } = require("../../../services/shop.service"); // 你的兌換邏輯
const { EmbedBuilder, Client, Interaction } = require("discord.js");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const itemKey = interaction.customId; // e.g. shop_rare_box

  try {
    const user = await interaction.guild.members.fetch(userId);
    const isBoosting = !!user.premiumSince;
    const result = await purchaseItem(userId, guildId, itemKey, isBoosting);

    const embed = new EmbedBuilder()
      .setTitle(`🛍️ 兌換成功！`)
      .setColor(0x00ccff)
      .addFields(
        { name: "🎁 商品", value: `**${result.name}**`, inline: false },
        { name: "💸 消耗", value: `${result.spent} 里程`, inline: true },
        {
          name: "💎 剩餘",
          value: `${result.remainingMileage} 里程`,
          inline: true,
        }
      )
      .setTimestamp();

    if (result.isBoosting) {
      embed.setFooter({
        text: `贊助者專屬折扣生效中！享有尊榮 ${Math.round(
          (1 - result.discountRate) * 100
        )}% OFF ✨`,
        iconURL:
          "https://cdn.discordapp.com/emojis/992112231561056326.webp?size=240",
      });
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content: `❌ ${error.message}`,
      ephemeral: true,
    });
  }
};
