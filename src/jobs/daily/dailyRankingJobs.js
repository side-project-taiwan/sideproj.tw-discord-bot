const { getClient } = require('../../services/time.service');
const { drawSpRanking } = require("../../utils/drawTeam");
const { fetchRankingData } = require("../../services/ranking.service");
const { env } = require("../../env");

module.exports = {
  name: 'update-daily-ranking',
  cron: '0 0 * * *',
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
