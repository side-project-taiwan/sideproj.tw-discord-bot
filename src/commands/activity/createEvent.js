const { env } = require("../../env");
const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  ChannelType,
} = require("discord.js");
const { createEventDraft } = require("../../services/activityTracker.service");
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
        content: "⚠️ 你沒有權限建立活動，請聯繫管理員。",
        ephemeral: true,
      });
    }
    // await interaction.deferReply();

    const topic = interaction.options.getString("主題");
    const description = interaction.options.getString("說明");
    const channel = interaction.options.getChannel("頻道");
    const channelId = channel.id;
    const speakerIds = [];
    for (let i = 1; i <= 3; i++) {
      const user = interaction.options.getUser(`分享者${i}`);
      if (user) speakerIds.push(user.id);
    }

    const result = await createEventDraft({
      guildId,
      hostId: userId,
      channelId,
      topic,
      description,
      speakerIds,
    });

    if (!result.success) {
      return interaction.reply({
        content: "⚠️ 活動建立失敗，請稍後再試。",
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `✅ 已建立活動草稿「${topic}」！請稍後使用 /活動開始 指定語音頻道以正式啟動。`,
      ephemeral: true,
    });
  },

  //base command data
  name: "活動建立",
  description: "建立一場語音活動的草稿",
  deleted: true, // Boolean
  options: [
    {
      name: "主題",
      description: "活動主題",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "說明",
      description: "活動簡介",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "頻道",
      description: "指定活動將使用的語音頻道",
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      name: "分享者1",
      description: "第一位分享者",
      required: false,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "分享者2",
      description: "第二位分享者",
      required: false,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "分享者3",
      description: "第三位分享者",
      required: false,
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
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
