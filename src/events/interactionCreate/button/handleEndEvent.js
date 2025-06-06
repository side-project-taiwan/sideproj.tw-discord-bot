const { findEventById } = require("../../../services/activityTracker.service");
module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^endEvent_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動，請稍後再試。",
      ephemeral: true,
    });
  }
  event.status = "ended";
  event.endTime = new Date();
  // TODO 整理參加者數據
  await event.save();
  return interaction.reply({
    content: `已結束活動 ${event.topic}`,
    ephemeral: true,
  });
};
