const { env } = require("../../env");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Client,
  Interaction,
} = require("discord.js");
const { getOrCreateUser, calculateSpLevelUp } = require("../../services/level.service");
const { getOrCreateInventory } = require("../../services/inventory.service");
const MileageShopItem = require("../../models/MileageShopItem");

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
    const [userLevel, inventory] = await Promise.all([
      getOrCreateUser(userId, guildId),
      getOrCreateInventory(userId, guildId),
    ]);
    // 是否有升級道具
    let upItems = [];
    if(inventory.items.length > 0){
      upItems = inventory.items.filter((item)=>{
        return ["job_scroll", "wisdom_crystal", "qigu_egg"].includes(item.key)
      })
    } else {
      await interaction.reply({
        content: `❌ 您目前沒有升級道具，請先取得道具再來升級！`,
        ephemeral: true,
      });
      return;
    }
    const { newSpLevel, remainingExp } = calculateSpLevelUp({nowSpLevel: userLevel.spLevel, nowSpExp: userLevel.spExp});
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
          name: "🛤️ 當前SP等級",
          value: `${userLevel.spLevel || 0}`,
          inline: false,
        },
        {
          name: "🛤️ 當前SP經驗",
          value: `${userLevel.spExp}`,
          inline: false,
        },
        {
          name: "🛤️ 升級後SP等級",
          value: `${newSpLevel}`,
          inline: false,
        },
        {
          name: "🛤️ 升級後剩餘經驗",
          value: `${remainingExp}`,
          inline: false,
        },
      );
    

    if(upItems.length === 0){
      embed.setColor(0xff0000)
      embed.addFields({name:"提醒",value: "您目前沒有可用於升等的道具，請先取得道具再來升級！", inline: false});
    }
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 0; i < upItems.length; i++) {
      const item = allItems.find((item) => item.key === upItems[i].key);
      if (!item){
        console.warn(`Item with key ${upItems[i].key} not found in allItems.`);
        continue;
      }
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
