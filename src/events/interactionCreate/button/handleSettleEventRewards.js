const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
const { getActivityRewardItemByParticipationRate, getModifyedLogs, getTotalSecands } = require("../../../utils/activityUtils");
const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");
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
  if (!event.startTime || !event.endTime) {
    return interaction.reply({
      content: "❌ 無法計算活動總時長，缺少必要的時間資訊。",
      ephemeral: true,
    });
  }
    // 計算活動總時長（以分鐘計算，無條件進位）
  const eventDurationMinutes = Math.ceil((event.endTime - event.startTime) / (1000 * 60));
  // const participants = await interaction.guild.members.fetch({user: Array.from(event.participants.keys())});
  const participants = Array.from(event.participants.keys()).map(userId => {
    return {
      id: userId,
      displayName: userId, // 假設 userId 為顯示名稱，實際應根據需要修改
    }
  })
  // 計算每位參加者的總分鐘數
  const participantData = participants.map((participant) => {
    const userId = participant.id;
    const logs = event.participants.get(userId) || [];
    const modifyedLogs = getModifyedLogs(logs, event.startTime, event.endTime);
    const totalSeconds = getTotalSecands(modifyedLogs)
    // 換算成分鐘，無條件進位
    const totalMinutes = Math.ceil(totalSeconds / 60);
    // 計算參與度百分比
    const participationRate = Math.min(100, Math.floor((totalMinutes / eventDurationMinutes) * 100));
    // 根據參與時間取得一個獎勵
    const rewardItem = getActivityRewardItemByParticipationRate(participationRate)
    return {
      name: participant.displayName,
      userId: participant.id,
      totalMinutes,
      originalLogs: logs,
      modifyedLogs,
      participationRate,
      rewardItem,
    };
  })
  const participantNames = participantData.map(p => {
    const logs = p.originalLogs.map(log => {
      return `(${log.join ? DateTime.fromJSDate(log.join).toFormat("HH:mm:ss") : "無進入"} - ${log.leave ? DateTime.fromJSDate(log.leave).toFormat("HH:mm:ss") : "無離開"})`;
    }).join(",\n");
    const modifyedLogs = p.modifyedLogs.map(log => {
      return `(${log.j ? DateTime.fromJSDate(log.j).toFormat("HH:mm:ss") : "無進入"} - ${log.l ? DateTime.fromJSDate(log.l).toFormat("HH:mm:ss") : "無離開"})`;
    }).join(",\n");
    return `${p.name}\n${logs}\n整理後時間\n${modifyedLogs}\n(${p.totalMinutes} 分鐘 參與度${p.participationRate}%)\n獎勵: ${p.rewardItem || "無"}`;
  }).join(",\n==============\n") || "無參加者";
  console.log(participantNames)

  // 將 participantNames 寫入檔案
  const filePath = path.join(__dirname, "participantNames.txt");
  fs.writeFileSync(filePath, participantNames);

  const embed = new EmbedBuilder()
    .setTitle("獎勵結算")
    .setDescription("【 預計會發放的獎勵內容 】")
    .setColor(0x00ccff)
    .addFields(
      {
        name: "活動開始時間",
        value: event.startTime ? new Date(event.startTime).toLocaleString() : "無",
        inline: false,
      },
      {
        name: "活動結束時間",
        value: event.endTime ? new Date(event.endTime).toLocaleString() : "無",
        inline: false,
      },
      {
        name: "活動總時長",
        value: `${eventDurationMinutes} 分鐘`,
        inline: false,
      },
      {
        name: "參加者",
        value: "參加者列表已寫入檔案，請查看附件。",
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
    files: [filePath],
    ephemeral: true,
  });
};
