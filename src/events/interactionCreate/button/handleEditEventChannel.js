const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");

module.exports = async (client, interaction) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const buttonKey = interaction.customId;
  const eventId = buttonKey.replace(/^editEventChannel_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }

  // 創建頻道選擇器來修改分享頻道
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`updateEventChannel_${eventId}`)
    .setPlaceholder('請選擇分享頻道～')
    .addChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]) // 篩選語音和舞台頻道
    .setMinValues(1)
    .setMaxValues(1);
  
  // 如果有現有頻道，預先勾選
  if (event.channelId) {
    channelSelect.setDefaultChannels([event.channelId]);
  }

  const row = new ActionRowBuilder().addComponents(channelSelect);

  return interaction.reply({
    content: '請選擇分享頻道',
    components: [row],
    ephemeral: true
  });
};
