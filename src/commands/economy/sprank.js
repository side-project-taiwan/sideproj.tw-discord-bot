const { Client, Interaction } = require("discord.js");
const { drawSpRanking } = require("../../utils/drawTeam");
const { fetchRankingData } = require("../../services/ranking.service");

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only available inside servers.");
      return;
    }

    const duration = interaction.options.getString("duration") || "all";
    const { teamInfo } = await fetchRankingData(interaction.guild, duration);
    const imageBuffer = await drawSpRanking(teamInfo, duration);

    await interaction.reply({
      files: [{ attachment: imageBuffer, name: "ranking.png" }],
    });
  },

  name: "sp-ranking",
  description: "Shows SP ranking leaderboard",
  options: [
    {
      name: "duration",
      description: "The duration of the ranking",
      type: 3,
      required: false,
      choices: [
        { name: "今日", value: "daily" },
        { name: "本週", value: "weekly" },
        { name: "本月", value: "monthly" },
        { name: "全部時間", value: "all" },
      ],
    },
  ],
};
