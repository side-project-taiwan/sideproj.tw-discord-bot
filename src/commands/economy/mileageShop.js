const { env } = require("../../env");
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Client,
  Interaction,
} = require("discord.js");

const MileageShopItem = require("../../models/MileageShopItem");
const Level = require("../../models/Level");
const { isFeatureEnabled } = require("../../services/featureToggle.service");
const { featureToggle } = require("../../../config.json");

module.exports = {
  name: "里程商店",
  description: "打開里程兌換商店",
  deleted: false,

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only available inside a servers.");
      return;
    }
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (guildId !== env.DISCORD_GUILD_ID) return;

    // 取得使用者資料
    const user = await interaction.guild.members.fetch(userId);
    const isBoosting = !!user.premiumSince;
    let footerContext = {};
    if (isBoosting) {
      footerContext = {
        text: `贊助者專屬折扣生效中！享有尊榮 8 折優惠 ✨`,
        iconURL:
          "https://cdn.discordapp.com/emojis/992112231561056326.webp?size=240",
      };
    } else {
      footerContext = {
        text: `贊助專屬｜立即享受「尊榮 8 折優惠」，更聰明兌換每一份資源 ✨`,
        iconURL:
          "https://cdn.discordapp.com/emojis/1319734666743255130.webp?size=240",
      };
    }

    const items = await MileageShopItem.find({ isActive: true }).sort({
      mileageCost: 1,
    });
    if (!items.length) {
      return interaction.reply({
        content: "目前沒有可兌換的商品。",
        ephemeral: true,
      });
    }

    // 取得使用者資料
    let userLevel = await Level.findOne({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
    });
    if (!userLevel) {
      // 沒有的話初始使用者
      userLevel = new Level({
        userId: interaction.member.id,
        guildId: interaction.guild.id,
        xp: 0,
        activity: 0,
        mileage: 0,
        level: 0,
        spExp: 0,
        spSigninCooldown: Date.now() + 60 * 60 * 1000,
      });
    }
    if (!(await isFeatureEnabled(featureToggle.mileage_shop))) {
      const embed = new EmbedBuilder()
        .setDescription("⚠️ **商店維護中**")
        .setColor("Red")
        .setTimestamp()
        .addFields(
          {
            name: "📝 說明",
            value: "簽到與活動可以獲得更多里程！",
            inline: true,
          },
          {
            name: "🛤️ 當前里程",
            value: `${userLevel.mileage} 點`,
            inline: false,
          }
        )
        .setFooter(footerContext);

      return await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🛒 里程兌換商店")
      .setDescription("【 **請點擊下方按鈕來兌換商品** 】")
      .setColor(0x00ccff)
      .setTimestamp()
      .addFields(
        {
          name: "📝 說明",
          value: "簽到與活動可以獲得更多里程！",
          inline: true,
        },
        {
          name: "🛤️ 當前里程",
          value: `${userLevel.mileage} 點`,
          inline: false,
        }
      )
      .setFooter(footerContext);

    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const button = new ButtonBuilder()
        .setCustomId(`shop_${item.key}`)
        .setLabel(`${item.name} ${formatShopPrice(item, isBoosting)}`)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);

      // 一行最多放 5 個按鈕
      if (currentRow.components.length === 5 || i === items.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }

    await interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true,
    });
  },
};

function formatShopPrice(item, isBoosting) {
  const originalPrice = item.mileageCost;
  const discount = isBoosting ? 0.8 : 1;
  const finalPrice = Math.floor(originalPrice * discount);

  if (isBoosting) {
    return `💎 ${finalPrice} 里程（原價 ${originalPrice}）`;
  } else {
    return `${originalPrice} 里程`;
  }
}
