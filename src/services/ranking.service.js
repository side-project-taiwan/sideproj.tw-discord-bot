const Level = require("../models/Level");
const SpExpChange = require("../models/SpExpChange");
const { DateTime, Settings } = require("luxon");
Settings.defaultZone = "Asia/Taipei";


async function fetchRankingData(guild, duration = "all") {
  let topUsers = [];

  if (duration === "all") {
    topUsers = await Level.find({ guildId: guild.id })
      .sort({ spLevel: -1, spExp: -1 })
      .limit(10);
  } else {
    const now = DateTime.now();
    let startTime = now.startOf("day").toJSDate();
    if (duration === "weekly") {
      startTime = now.startOf("week").toJSDate();
    } else if (duration === "monthly") {
      startTime = now.startOf("month").toJSDate();
    }

    const changes = await SpExpChange.aggregate([
      {
        $match: {
          guildId: guild.id,
          timestamp: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: "$userId",
          spExp: { $sum: "$expChange" },
        },
      },
      { $sort: { spExp: -1 } },
      { $limit: 10 },
      {
        $project: {
          userId: "$_id",
          spExp: 1,
          _id: 0,
        },
      },
    ]);

    const userIds = changes.map((u) => u.userId);
    const levels = await Level.find({
      guildId: guild.id,
      userId: { $in: userIds },
    });
    const levelMap = new Map(levels.map((l) => [l.userId, l]));

    topUsers = changes.map((u) => {
      const level = levelMap.get(u.userId) || { spLevel: 0, spExp: 0 };
      return {
        userId: u.userId,
        gainExp: u.spExp,
        spExp: level.spExp,
        spLevel: level.spLevel,
      };
    });
  }

  const userIds = topUsers.map((u) => u.userId);
  const users = await guild.members.fetch({ user: userIds });

  const teamInfo = topUsers.map((user) => {
    const member = users.get(user.userId);
    return {
      userId: user.userId,
      name: member?.displayName || "Unknown",
      spExp: user.spExp,
      gainExp: user.gainExp ?? null,
      level: user.spLevel ?? 0,
      avatar: member?.displayAvatarURL({ extension: "png", size: 64 }) || "",
    };
  });

  return { teamInfo };
}

module.exports = { fetchRankingData };
