const {
  Client,
  Interaction,
} = require("discord.js");
const Level = require("../../models/Level");
const SpExpChange = require("../../models/SpExpChange");
const { DateTime, Settings } = require("luxon");
Settings.defaultZone = "Asia/Taipei";
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only available inside servers.");
      return;
    }
    const duration = interaction.options.getString('duration') || 'all';
    let top10users = [];
    if(duration === 'all'){
      top10users = await Level.find({
        guildId: interaction.guild.id,
      }).sort({ spExp: -1 }).limit(10);
    } else {
      const now = DateTime.now();
      let startTime = now.startOf('day').toJSDate();
      switch (duration) {
        case 'daily':
          break;
        case 'weekly':
          startTime = now.startOf('week').toJSDate();
          break;
        case 'monthly':
          startTime = now.startOf('month').toJSDate();
          break;
        default:
          break;
      }
      top10users = await SpExpChange.aggregate([
        {
          $match: {
            guildId: interaction.guild.id,
            timestamp: {
              $gte: startTime,
            },
          },
        },
        {
          $group: {
            _id: "$userId",
            spExp: { $sum: "$expChange" },
          },
        },
        {
          $sort: { spExp: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            userId: "$_id",
            spExp: 1,
            _id: 0,
          },
        }
      ]);
    }
    const userIds = top10users.map((user) => user.userId);
    const users = await interaction.guild.members.fetch({user: userIds});
    const getRankingIcon = (index, userId) => {
        if(userId === '362797826453012491'){
            return "<:image:1227521779719733280>";
        }
        switch (index) {
        case 0:
            return ":first_place:";
        case 1:
            return ":second_place:";
        case 2:
            return ":third_place:";
        default:
            return "<:Sheep:1224251953555443812>";
        }
    }
    const rankingLabels = top10users.map((top10user, index) => {
        const userInfo = users.find((user) => user.id === top10user.userId);
        return `${index + 1}. ${getRankingIcon(index, top10user.userId)} ${userInfo.displayName}(${top10user.spExp})`;
    });
    await interaction.reply(`Ranking of SP exp(${duration}):\n ${rankingLabels.join("\n")}`);
  },

  //base command data
  name: "sp-ranking",
  description: "Shows voice channel members list",
  options: [
    {
      name: 'duration',
      description: 'The duration of the ranking',
      type: 3,
      required: false,
      choices: [
        {
          name: '今日',
          value: 'daily',
        },
        {
          name: '本週',
          value: 'weekly',
        },
        {
          name: '本月',
          value: 'monthly',
        },
        {
          name: '全部時間',
          value: 'all',
        },
      ],
    }
  ]
};
