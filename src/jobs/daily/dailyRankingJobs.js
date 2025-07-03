const { getClient } = require('../../services/time.service');
const { drawSpRanking } = require("../../utils/drawTeam");
const { fetchRankingData } = require("../../services/ranking.service");
const { env } = require("../../env");

module.exports = {
  name: 'update-daily-ranking',
  // Run at 23:59 Taiwan time (UTC+8)
  // TODO: Switch to 00:00 and fetch previous day’s data.
  cron: '59 15 * * *',
  handler: async () => {
    const now = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
    const client = getClient();
    const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
    const channel = await client.channels.fetch(env.channels.sp);
    const label = `${now} Daily`;

    const { teamInfo } = await fetchRankingData(guild, "daily");
    const imageBuffer = await drawSpRanking(teamInfo, label);

    await channel.send({
      files: [{ attachment: imageBuffer, name: "ranking.png" }],
    });
  },
};
