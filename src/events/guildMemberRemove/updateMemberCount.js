const { Client, GuildMember } = require("discord.js");
const config = require("../../../config.json");

/**
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  console.log(`[🧼] guildMemberRemove: ${member.user.tag}`);
  const channelId = config.channels.memberCount;
  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel || channel.type !== 2) return; // type 2 = voice channel

  try {
    const count = member.guild.memberCount;
    await channel.setName(`👥 成員人數：${count}人`);
  } catch (err) {
    console.error("❌ 無法更新成員人數頻道名稱：", err);
  }
};
