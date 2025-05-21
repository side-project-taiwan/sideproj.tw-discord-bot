const { findEventById } = require("../../../services/activityTracker.service");
module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^startEvent_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動草稿，請稍後再試。",
      ephemeral: true,
    });
  }
  // 查詢現在活動channel中的人並記錄
  const channel = await interaction.guild.channels.fetch(event.channelId);
  const members = channel.members.map((member) => {
    return [
      member.user.id,
      [
        {
          join: new Date(),
          leave: null,
        }
      ]
    ]
  });
  const participants = Object.fromEntries(members);
  event.startTime = new Date();
  event.status = "active";
  event.participants = participants;
  await event.save();
  return interaction.reply({
    content: `開啟活動 ${userId}, ${guildId}, ${buttonKey}`,
    ephemeral: true,
  });
};
