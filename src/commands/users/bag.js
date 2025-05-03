const { env } = require("../../env");
const MileageShopItem = require("../../models/MileageShopItem");
const { getOrCreateUser } = require("../../services/level.service");
const { getOrCreateInventory } = require("../../services/inventory.service");
const { EmbedBuilder, Client, Interaction } = require("discord.js");
const { getIconByRewardType } = require("../../enums/mileageShop.enum");

module.exports = {
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
    if (interaction.guild.id !== env.DISCORD_GUILD_ID) return;

    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    const inventory = await getOrCreateInventory(userId, guildId);
    const keys = inventory.items.map((i) => i.key);
    const shopItems = await MileageShopItem.find({ key: { $in: keys } });

    // 建立對應 Map
    const itemMap = Object.fromEntries(
      shopItems.map((item) => [item.key, item])
    );

    const embed = new EmbedBuilder()
      .setTitle(`🎒 背包`)
      .setImage(
        "https://cdn.discordapp.com/attachments/1157094864979247124/1363509917335552242/rainbow_line.GIF?ex=68176e91&is=68161d11&hm=1f0a466c87e5fb103ec33008b5aae7d72996a3f6a3ad3d0830b3775c06719a3f&"
      )
      .setColor(0x00ccff)
      .setFooter({
        text: "使用 /里程商店 來兌換更多道具",
        iconURL:
          "https://cdn.discordapp.com/emojis/1152844170533294100.webp?size=96",
      })
      .setTimestamp();

    if (inventory.items.length > 0) {
      for (const item of inventory.items) {
        const meta = itemMap[item.key];
        const emoji = getIconByRewardType(meta?.rewardType);
        const name = meta?.name || item.key;
        const desc = meta?.description || "（尚無描述）";

        embed.addFields({
          name: `${emoji} ${name} x${item.quantity}`,
          value: desc,
          inline: false,
        });
      }
    } else {
      embed.setDescription("📭 目前背包是空的，快去商店逛逛吧！");
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  //base command data
  name: "背包",
  description: "查看你的背包道具",
  deleted: false, // Boolean 控制是否廢棄指令
};
