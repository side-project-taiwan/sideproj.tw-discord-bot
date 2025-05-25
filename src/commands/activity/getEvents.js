const { env } = require("../../env");
const {
  Client,
  Interaction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ApplicationFlagsBitField,
} = require("discord.js");
const {
  getEvents,
} = require("../../services/activityTracker.service");
const statusText = {
  draft: "草稿",
  active: "進行中",
  ended: "已結束",
};
const statusStyle = {
  draft: ButtonStyle.Secondary,
  active: ButtonStyle.Success,
  ended: ButtonStyle.Primary,
};
const { channels, roles } = require("../../../config.json");

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
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (guildId !== env.DISCORD_GUILD_ID) return;

    if (!interaction.member.roles.cache.has(roles.eventHost)) {
      return interaction.reply({
        content: "⚠️ 你沒有權限查看活動，請聯繫管理員。",
        ephemeral: true,
      });
    }

    const draftEvents = await getEvents(interaction.guildId);

    if (!draftEvents.length) {
      return interaction.reply({
        content: "📭 今天沒有可以啟動的活動草稿。",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📅 近期活動列表")
      .setDescription("請點擊下方按鈕來選擇要查看的活動")
      .setColor(0x00ccff)
      .setTimestamp();

    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (let i = 0; i < draftEvents.length; i++) {
      const event = draftEvents[i];
      const button = new ButtonBuilder()
        .setCustomId(`eventDetail_${event._id}`)
        .setLabel(`${event.topic}(${statusText[event.status]})`)
        .setStyle(statusStyle[event.status])

      currentRow.addComponents(button);

      if (currentRow.components.length === 5 || i === draftEvents.length - 1) {
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

  //base command data
  name: "查看活動",
  description: "查看活動清單",
  deleted: false, // Boolean
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
