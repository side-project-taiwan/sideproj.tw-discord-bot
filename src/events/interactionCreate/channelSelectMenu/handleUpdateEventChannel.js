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
  const eventId = buttonKey.replace(/^updateEventChannel_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }
  const selectedChannelId = interaction.values[0]
  console.log("Selected channel ID:", selectedChannelId);
  const channel = await client.channels.fetch(selectedChannelId);
  event.channelId = selectedChannelId;
  await event.save();
  return interaction.reply({content: `已更新活動場地：${channel.name}`, ephemeral: true });
};
