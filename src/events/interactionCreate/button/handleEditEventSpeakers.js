const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");

module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^editEventSpeakers_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }

  // 創建用戶選擇器來修改分享者
  const speakerSelectMenu = new UserSelectMenuBuilder()
    .setCustomId(`updateEventSpeakers_${eventId}`)
    .setPlaceholder('請選擇分享者～')
    .setMinValues(1)
    .setMaxValues(25);
  
  // 如果有現有分享者，預先勾選
  if (event.speakerIds && event.speakerIds.length > 0) {
    speakerSelectMenu.setDefaultUsers(event.speakerIds);
  }

  const row = new ActionRowBuilder().addComponents(speakerSelectMenu);

  return interaction.reply({
    content: '請選擇分享者',
    components: [row],
    ephemeral: true
  });
};
