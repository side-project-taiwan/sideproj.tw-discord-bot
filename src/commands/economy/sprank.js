const {
  Client,
  Interaction,
} = require("discord.js");
const Level = require("../../models/Level");
const SpExpChange = require("../../models/SpExpChange");
const drawSpRanking = require("../../utils/drawTeam");
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

    if (duration === 'all') {
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

      // Get level
      const userIds = top10users.map((u) => u.userId);
      const levels = await Level.find({
        guildId: interaction.guild.id,
        userId: { $in: userIds },
      });
      const levelMap = new Map(levels.map((l) => [l.userId, l.level]));
      top10users = top10users.map((u) => ({
        ...u,
        level: levelMap.get(u.userId) || 1,
      }));
    }

    // Get user info
    const userIds = top10users.map((u) => u.userId);
    const users = await interaction.guild.members.fetch({ user: userIds });

    const teamInfo = top10users.map((user) => {
      const member = users.get(user.userId);
      return {
        userId: user.userId,
        name: member?.displayName || "Unknown",
        spExp: duration === "all" ? user.spExp : `+${user.spExp}`,
        level: user.level || 1,
        avatar: member.displayAvatarURL({ extension: "png", size: 64 }),
      };
    });

    const imageBuffer = await drawSpRanking(teamInfo, duration);

    await interaction.reply({
      files: [{ attachment: imageBuffer, name: "ranking.png" }],
    });
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
