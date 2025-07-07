module.exports = {
  name: 'update-weekly-ranking',
  // Run at 23:59 Taiwan time (UTC+8) on Sunday
  cron: '59 15 * * 0', // 週日 UTC+0 的 15:59 = 台灣時間週日 23:59
  handler: async () => {
    const now = new Date().toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" });
    const client = getClient();
    const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
    const channel = await client.channels.fetch(env.channels.sp);
    const label = `${now} Weekly`;

    const { teamInfo } = await fetchRankingData(guild, "weekly");
    const imageBuffer = await drawSpRanking(teamInfo, label);

    await channel.send({
      files: [{ attachment: imageBuffer, name: "weekly-ranking.png" }],
    });
  },
};
