const Level = require("../models/Level");

module.exports = async function getTeamMembersInfo(userIds, guild) {
  const levelMap = {};
  const levels = await Level.find({
    userId: { $in: userIds },
    guildId: guild.id,
  });

  levels.forEach((lvl) => {
    levelMap[lvl.userId.toString()] = lvl;
  });

  const results = await Promise.allSettled(
    userIds.map((id) => guild.members.fetch(id))
  );

  const fulfilledMembers = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => {
      const member = r.value;
      const id = member.user.id;
      const level = levelMap[id];

      return {
        userId: id,
        name: member?.displayName || member.user.username || "Unknown",
        avatar: member?.displayAvatarURL({ extension: "png", size: 64 }) || "",
        level: level?.spLevel || 0,
        spExp: level?.spExp || 0,
      };
    });

  return {
    members: fulfilledMembers,
    count: fulfilledMembers.length,
  };
};
