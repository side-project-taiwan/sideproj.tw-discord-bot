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
  const eventId = buttonKey.replace(/^editEvent_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }
  const modal = new ModalBuilder()
    .setCustomId(`updateEvent_${eventId}`)
    .setTitle('編輯活動資訊');

  // 創建文字輸入框
  const eventNameInput = new TextInputBuilder()
    .setCustomId('eventName') // 輸入框的唯一 ID
    .setLabel("新的活動名稱")
    .setValue(event.topic) // 預設值為當前活動名稱
    .setStyle(TextInputStyle.Short) // 短文字輸入
    .setPlaceholder('例如：春季野餐')
    .setRequired(true); // 可選：設為必填
  const eventDescriptionInput = new TextInputBuilder()
    .setCustomId('eventDescription')
    .setLabel("新的活動描述")
    .setValue(event.description) // 預設值為當前活動描述
    .setStyle(TextInputStyle.Paragraph) // 長文字輸入 (段落)
    .setPlaceholder('詳細說明活動內容...')
    .setRequired(true);
  // 將輸入框加入到 Modal 的 ActionRow 中 (Modal 中每行是一個 ActionRow)
  const firstActionRow = new ActionRowBuilder().addComponents(eventNameInput);
  const secondActionRow = new ActionRowBuilder().addComponents(eventDescriptionInput);
  // const thirdActionRow = new ActionRowBuilder().addComponents(eventDateInput);

  // 將 ActionRow 加入到 Modal
  modal.addComponents(firstActionRow, secondActionRow);

  // 顯示 Modal 給用戶
  return await interaction.showModal(modal);
};
