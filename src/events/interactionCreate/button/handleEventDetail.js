const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, ChannelSelectMenuBuilder } = require("discord.js");
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
  const eventId = buttonKey.replace(/^eventDetail_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }
  const channel = await client.channels.fetch(event.channelId);
  const speakers = await interaction.guild.members.fetch({user: event.speakerIds});
  const speakerNames = speakers.map(speaker => `${speaker.displayName}`).join(", ") || "無";
  console.log(Array.from(event.participants.keys()));
  const participants = await interaction.guild.members.fetch({user: Array.from(event.participants.keys())});
  const participantNames = participants.map(participant => `${participant.displayName}`).join(", ") || "無";
  const embed = new EmbedBuilder()
    .setTitle(`活動資訊`)
    .addFields(
      {
        name: "活動名稱",
        value: `${event.topic}`,
        inline: false,
      },
      {
        name: "活動描述",
        value: `${event.description}`,
        inline: false,
      },
      { name: "分享者", value: `${speakerNames}`},
      { name: "參與者", value: `${participantNames}`},
      { name: "頻道", value: `${channel.name}`, inline: false },
      {
        name: "開始時間",
        value: `${event.startTime}`,
        inline: false,
      },
      {
        name: "結束時間",
        value: `${event.endTime}`,
        inline: false,
      },
      {
        name: "活動狀態",
        value: `${statusText[event.status]}`,
        inline: false,
      },
    )
    .setColor(0x00ccff)
    .setFooter({
      text: "SPT",
      iconURL:
        "https://cdn.discordapp.com/emojis/1224251953555443812.webp?size=96",
    })
    .setTimestamp();
  const rows = [];
  const currentRow = new ActionRowBuilder();
  if( event.status === "active") {
    const button = new ButtonBuilder()
      .setCustomId(`endEvent_${event._id}`)
      .setLabel(`結束活動`)
      .setStyle(ButtonStyle.Danger);
    currentRow.addComponents(button);
  }
  const button = new ButtonBuilder()
      .setCustomId(`editEvent_${event._id}`)
      .setLabel(`編輯活動資訊`)
      .setStyle(ButtonStyle.Primary);
    currentRow.addComponents(button);
  const selectRow = new ActionRowBuilder();
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`updateEventChannel_${event._id}`)
    .setPlaceholder('修改語音頻道')
    .addChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]) // 篩選語音和舞台頻道
    .setDefaultChannels([event.channelId])
    .setMinValues(1)
    .setMaxValues(1);
  
  selectRow.addComponents(channelSelect);
  rows.push(currentRow);
  rows.push(selectRow);
  return interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
};
