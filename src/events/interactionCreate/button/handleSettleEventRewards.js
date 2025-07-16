const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
const { getActivityRewardItemByParticipationRate, getModifyedLogs, getTotalSecands, generateRewardResults } = require("../../../utils/activityUtils");
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
  const speakers = await interaction.guild.members.fetch({user: event.speakerIds});
  const hosts = await interaction.guild.members.fetch({user: event.hostIds || []});
  
  let rewardResults, participantData, eventDurationMinutes;
  
  // 檢查是否已經產生過獎勵資料
  if (event.rewardResults && 
      event.rewardResults.hosts && 
      event.rewardResults.speakers && 
      event.rewardResults.participants &&
      (event.rewardResults.hosts.length > 0 || 
       event.rewardResults.speakers.length > 0 || 
       event.rewardResults.participants.length > 0)) {
    
    console.log("獎勵資料已存在，使用現有資料");
    rewardResults = event.rewardResults;
    
    // 重新計算 participantData 和 eventDurationMinutes 用於顯示
    const { participantData: newParticipantData, eventDurationMinutes: newEventDurationMinutes } = generateRewardResults(event);
    participantData = newParticipantData;
    eventDurationMinutes = newEventDurationMinutes;
  } else {
    console.log("獎勵資料不存在，重新生成");
    // 呼叫整合後的函數，取得獎勵結果和相關資料
    const result = generateRewardResults(event);
    rewardResults = result.rewardResults;
    participantData = result.participantData;
    eventDurationMinutes = result.eventDurationMinutes;
    
    event.rewardResults = rewardResults;
    await event.save();
  }
  // console.log("獎勵結果: ", rewardResults);
  const participantNames = participantData.map(p => {
    const logs = p.originalLogs.map(log => {
      return `(${log.join ? DateTime.fromJSDate(log.join).toFormat("HH:mm:ss") : "無進入"} - ${log.leave ? DateTime.fromJSDate(log.leave).toFormat("HH:mm:ss") : "無離開"})`;
    }).join(",\n");
    const modifyedLogs = p.modifyedLogs.map(log => {
      return `(${log.j ? DateTime.fromJSDate(log.j).toFormat("HH:mm:ss") : "無進入"} - ${log.l ? DateTime.fromJSDate(log.l).toFormat("HH:mm:ss") : "無離開"})`;
    }).join(",\n");
    return `${p.name}\n${logs}\n整理後時間\n${modifyedLogs}\n(${p.totalMinutes} 分鐘 參與度${p.participationRate}%)\n獎勵: ${p.rewardItem || "無"}`;
  }).join(",\n==============\n") || "無參加者";

  // 將 participantNames 寫入檔案
  const filePath = path.join(__dirname, "participantNames.txt");
  fs.writeFileSync(filePath, participantNames);

  // 計算參加者統計資料
  const totalParticipants = participantData.length;
  const participantsWithRewards = participantData.filter(p => p.rewardItem && p.rewardItem !== "").length;

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
        name: "主持人",
        value: hosts.map(host => `${host.displayName} - ${rewardResults.hosts.find(r => r.hostId === host.id)?.reward || "無"} x${rewardResults.hosts.find(r => r.hostId === host.id)?.quantity || 0}`).join(", ") || "無",
        inline: false,
      },
      {
        name: "分享者",
        value: speakers.map(speaker => `${speaker.displayName} - ${rewardResults.speakers.find(r => r.speakerId === speaker.id)?.reward || "無"}`).join(", ") || "無",
        inline: false,
      },
      {
        name: "參加者",
        value: `參加者共${totalParticipants}人(其中${participantsWithRewards}人獲得獎勵)\n詳細列表已寫入檔案，請查看附件。`,
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
