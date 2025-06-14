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
  const eventId = buttonKey.replace(/^settleEventRewards_/, ""); 
  // 提取eventId
  const event = await findEventById(eventId);
  if (!event) {
    return interaction.reply({
      content: "❌ 找不到活動。",
      ephemeral: true,
    });
  }
  console.log(event)
  const participants = await interaction.guild.members.fetch({user: Array.from(event.participants.keys())});
  // 計算每位參加者的總分鐘數
  const participantNames = participants.map((participant) => {
    const userId = participant.id;
    const logs = event.participants.get(userId) || [];
    let totalSeconds = 0;

    // 處理多次進出的紀錄
    let lastJoinTime = null; // 用於追蹤上一個有效的 joinTime
    logs.forEach((log, index) => {
      let joinTime = log.join ? new Date(log.join) : null;
      let leaveTime = log.leave ? new Date(log.leave) : null;

      // 規則處理
      if (!joinTime && !leaveTime) {
        // a. join 和 leave 都沒有，視為沒參加
        return;
      } else if (joinTime && leaveTime) {
        // b. 正常計算
        totalSeconds += Math.round((leaveTime - joinTime) / 1000);
        lastJoinTime = null; // 重置 lastJoinTime
      } else if (!joinTime && leaveTime) {
        if (index === 0) {
          // c. 第一筆沒 join，有 leave，視為一開始就參加
          joinTime = new Date(event.startTime);
          totalSeconds += Math.round((leaveTime - joinTime) / 1000);
        } else if (lastJoinTime) {
          // c. 非第一筆沒 join，有 leave，與上一筆合併
          totalSeconds += Math.round((leaveTime - lastJoinTime) / 1000);
          lastJoinTime = null; // 重置 lastJoinTime
        }
      } else if (joinTime && !leaveTime) {
        if (index === logs.length - 1) {
          // d. 最後一筆有 join，沒 leave，視為待到活動結束
          leaveTime = new Date(event.endTime);
          totalSeconds += Math.round((leaveTime - joinTime) / 1000);
        } else {
          // 暫存 joinTime，等待後續處理
          lastJoinTime = joinTime;
        }
      }
    });

    // 換算成分鐘，無條件進位
    const totalMinutes = Math.ceil(totalSeconds / 60);

    return `${participant.displayName} (${totalMinutes} 分鐘)`;
  }).join(", ") || "無";

  const embed = new EmbedBuilder()
    .setTitle("獎勵結算")
    .setDescription("【 預計會發放的獎勵內容 】")
    .setColor(0x00ccff)
    .addFields(
      {
        name: "參加者",
        value: `${participantNames}`,
        inline: false,
      },
    );
  const rows = [];
  let currentRow = new ActionRowBuilder();
  const button = new ButtonBuilder()
    .setCustomId(`doSettleRewards_${eventId}`)
    .setLabel(`執行發放獎勵`)
    .setStyle(ButtonStyle.Primary);

  currentRow.addComponents(button);
  rows.push(currentRow);
  await interaction.reply({
    embeds: [embed],
    components: rows,
    ephemeral: true,
  });
};
