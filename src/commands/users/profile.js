const { env } = require("../../env");
const Level = require("../../models/Level");
const CheckIn = require("../../models/CheckIn");
const { StreakRewardByDay } = require("../../enums/streak.enum");
const { getOrCreateUser } = require("../../services/level.service");
const { EmbedBuilder, Client, Interaction } = require("discord.js");

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

    const [level, checkIn] = await Promise.all([
      getOrCreateUser(userId, guildId),
      CheckIn.findOne({ userId, guildId }),
    ]);

    const displayTime =
      checkIn?.lastCheckInTime?.toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) || "尚未簽到";

    const user = await interaction.guild.members.fetch({
      user: userId,
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎴 冒險者資料卡`)
      .setImage(
        "https://cdn.discordapp.com/attachments/1157094864979247124/1363509917335552242/rainbow_line.GIF?ex=68176e91&is=68161d11&hm=1f0a466c87e5fb103ec33008b5aae7d72996a3f6a3ad3d0830b3775c06719a3f&"
      )
      .addFields(
        {
          name: "👤 暱稱",
          value: user.displayName,
          inline: false,
        },
        {
          name: "🎖️ 等級",
          value: `**Lv.** ${level.level}\n**Exp:** ${level.xp}`,
          inline: false,
        },
        { name: "活躍值", value: `🔥 ${level.activity}`, inline: true },
        { name: "里程", value: `🛤️ ${level.mileage}`, inline: true },
        {
          name: "📘 Side Project 經驗",
          value: `${level.spExp} **SP**`,
          inline: true,
        },
        {
          name: "📅 連續簽到",
          value: `${checkIn?.streak || 0} 天`,
          inline: true,
        },
        { name: "⏰ 上次簽到", value: `${displayTime}`, inline: true }
      )
      .setColor(0x00ccff)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({
        text: "SPT",
        iconURL:
          "https://cdn.discordapp.com/emojis/1224251953555443812.webp?size=96",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  //base command data
  name: "冒險卡",
  description: "查看你的冒險者身分資料卡",
  deleted: false, // Boolean 控制是否廢棄指令
};
