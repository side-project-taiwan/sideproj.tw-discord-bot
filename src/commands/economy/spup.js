const { env } = require("../../env");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Client,
  Interaction,
} = require("discord.js");

const MileageShopItem = require("../../models/MileageShopItem");
const Level = require("../../models/Level");
const Inventory = require("../../models/Inventory");

module.exports = {
  name: "spup",
  description: "提升side project等級",
  deleted: false,

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only available inside a server.");
      return;
    }
    const userId = interaction.member.id;
    const guildId = interaction.guild.id;

    if (guildId !== env.DISCORD_GUILD_ID) return;

    const allItems = await MileageShopItem.find();
    // 取得使用者資料
    let userLevel = await Level.findOne({
      userId,
      guildId,
    });
    if (!userLevel) {
      // 沒有的話初始使用者
      userLevel = new Level({
        userId,
        guildId,
        xp: 0,
        activity: 0,
        mileage: 0,
        level: 0,
        spExp: 0,
        spSigninCooldown: Date.now() + 60 * 60 * 1000,
      });
    }
    const inventory = await Inventory.findOne({
      userId,
      guildId,
    });
    const embed = new EmbedBuilder()
      .setTitle("SP等級提升")
      .setDescription("【 **請選擇要使用的道具** 】")
      .setColor(0x00ccff)
      .addFields(
        {
          name: "📝 說明",
          value: "可將SP經驗值轉換成等級",
          inline: true,
        },
        {
          name: "🛤️ 當前SP經驗",
          value: `${userLevel.spExp}`,
          inline: false,
        }
      );
    let upItems = [];
    if(inventory && inventory.items.length > 0){
      upItems = inventory.items.filter((item)=>{
        return ["job_scroll", "wisdom_crystal", "qigu_egg"].includes(item.key)
      })
    }
    if(upItems.length === 0){
      embed.setColor(0xff0000)
      embed.addFields({name:"提醒",value: "您目前沒有可用於升等的道具，請先取得道具再來升級！", inline: false});
    }
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 0; i < upItems.length; i++) {
      const item = allItems.find((item) => item.key === upItems[i].key);
      const button = new ButtonBuilder()
        .setCustomId(`spup_${item.key}`)
        .setLabel(`${item.name}(持有${upItems[i].quantity})`)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);
    }
    rows.push(currentRow);
    await interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true,
    });
  },
};
