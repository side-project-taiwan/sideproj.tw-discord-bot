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
    const items = await MileageShopItem.find({ isActive: true }).sort({
      mileageCost: 1,
    });
    if (!items.length) {
      return interaction.reply({
        content: "目前沒有可兌換的商品。",
        // ephemeral: true,
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
    const user = await interaction.guild.members.fetch({
      user: interaction.member.id,
    });

    const embed = new EmbedBuilder()
      .setTitle("🛒 里程兌換商店")
      .setDescription("【 **請點擊下方按鈕來兌換商品** 】")
      .setColor(0x00ccff)
      .setFooter({
        text: `${user.displayName} 的里程資訊`,
        iconURL: interaction.user.displayAvatarURL(),
      })
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
      );

    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const button = new ButtonBuilder()
        .setCustomId(`shop_${item.key}`)
        .setLabel(`${item.name}（${item.mileageCost} 里程）`)
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
