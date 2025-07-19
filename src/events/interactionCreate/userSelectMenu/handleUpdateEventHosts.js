const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
const statusText = {
  draft: "草稿",
  active: "進行中",
  ended: "已結束",
};
module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^updateEventHosts_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }
  const selectedUserIds = interaction.values;
  console.log("Selected host IDs:", selectedUserIds);
  
  // 獲取選中的用戶資訊
  const selectedMembers = await interaction.guild.members.fetch({user: selectedUserIds});
  const hostNames = selectedMembers.map(member => member.displayName).join(", ");
  
  event.hostIds = selectedUserIds;
  await event.save();
  
  return interaction.reply({
    content: `已更新活動主持人為：${hostNames}`,
    ephemeral: true
  });
};
