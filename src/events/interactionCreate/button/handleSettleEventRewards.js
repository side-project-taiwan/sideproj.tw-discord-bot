const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputStyle, TextInputBuilder } = require("discord.js");
const { findEventById } = require("../../../services/activityTracker.service");
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
  // const participants = await interaction.guild.members.fetch({user: Array.from(event.participants.keys())});
  const participants = Array.from(event.participants.keys()).map(userId => {
    return {
      id: userId,
      displayName: userId, // 假設 userId 為顯示名稱，實際應根據需要修改
    }
  })
  let earliestJoinTime = null;
  let latestLeaveTime = null;

  // 計算每位參加者的總分鐘數
  const participantData = participants.map((participant) => {
    const userId = participant.id;
    const logs = event.participants.get(userId) || [];
    const originalLogs = []
    const modifyedLogs = []
    let totalSeconds = 0;

    // 處理多次進出的紀錄
    let lastJoinTime = null; // 用於追蹤上一個有效的 joinTime
    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      let joinTime = log.join ? new Date(log.join) : null;
      let leaveTime = log.leave ? new Date(log.leave) : null;
      originalLogs.push({ 
        j: joinTime ? DateTime.fromJSDate(joinTime).toFormat("HH:mm:ss") : null, 
        l: leaveTime ? DateTime.fromJSDate(leaveTime).toFormat("HH:mm:ss") : null 
      });
      // 更新最早進入和最後離開的時間
      if (joinTime) {
        if (!earliestJoinTime || joinTime < earliestJoinTime) {
          earliestJoinTime = joinTime;
        }
      }
      if (leaveTime) {
        if (!latestLeaveTime || leaveTime > latestLeaveTime) {
          latestLeaveTime = leaveTime;
        }
      }

      // 規則處理
      if (!joinTime && !leaveTime) {
        // a. join 和 leave 都沒有，視為沒參加
        continue;
      } else if (joinTime && leaveTime) {
        // b. 正常計算
        if (index === 0) {
          totalSeconds += Math.round((leaveTime - joinTime) / 1000);
          lastJoinTime = null; // 重置 lastJoinTime
          modifyedLogs.push({
            j: joinTime,
            l: leaveTime,
          });
        } else {
          const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
          if (lastModifyedLog.l) {
            totalSeconds += Math.round((leaveTime - joinTime) / 1000);
            lastJoinTime = null; // 重置 lastJoinTime
            modifyedLogs.push({
              j: joinTime,
              l: leaveTime,
            });
          } else {
            // 如果上一筆沒有離開時間，則視為從上一筆 join 時間開始計算
            totalSeconds += Math.round((leaveTime - lastModifyedLog.j) / 1000);
            lastJoinTime = null; // 重置 lastJoinTime
            lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間
          }
        }
      } else if (!joinTime && leaveTime) {
        if (index === 0) {
          // c. 第一筆沒 join，有 leave，視為一開始就參加
          joinTime = new Date(event.startTime);
          totalSeconds += Math.round((leaveTime - joinTime) / 1000);
          modifyedLogs.push({
            j: joinTime,
            l: leaveTime,
          });
        } else {
          // c. 非第一筆沒 join，有 leave，與上一筆合併
          const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
          if (lastModifyedLog.l) {
            totalSeconds += Math.round((leaveTime - lastModifyedLog.l) / 1000);
            lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間
          } else {
            // 如果上一筆沒有離開時間，則視為從上一筆 join 時間開始計算
            totalSeconds += Math.round((leaveTime - lastJoinTime) / 1000);
            lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間   
          }
        }
      } else if (joinTime && !leaveTime) {
        if (logs.length === 1) {
            leaveTime = new Date(event.endTime);
            totalSeconds += Math.round((leaveTime - joinTime) / 1000);
            modifyedLogs.push({
              j: joinTime,
              l: leaveTime,
            });
            continue;
        }
        if (index === 0) {
          modifyedLogs.push({
            j: joinTime,
            l: null,
          });
        } else if (index === logs.length - 1) {
          // d. 最後一筆有 join，沒 leave，視為待到活動結束
          const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
          if (lastModifyedLog.l) {
            leaveTime = new Date(event.endTime);
            totalSeconds += Math.round((leaveTime - joinTime) / 1000);
            modifyedLogs.push({
              j: joinTime,
              l: leaveTime,
            });
          } else {
            // 如果上一筆沒有離開時間，則視為從上一筆 join 時間開始計算
            leaveTime = new Date(event.endTime);
            totalSeconds += Math.round((leaveTime - lastModifyedLog.j) / 1000);
            lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間
          }
        } else {
          const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
          if(lastModifyedLog.l) {
            modifyedLogs.push({
              j: joinTime,
              l: null,
            });
          }
        }
      }
    }

    // 換算成分鐘，無條件進位
    const totalMinutes = Math.ceil(totalSeconds / 60);
    return {
      name: participant.displayName,
      userId: participant.id,
      totalMinutes: totalMinutes,
      originalLogs,
      modifyedLogs,
    };
  })
  // 確保活動開始和結束時間存在，若缺失則使用最早進入和最後離開的時間
  const actualStartTime = event.startTime ? new Date(event.startTime) : earliestJoinTime;
  const actualEndTime = event.endTime ? new Date(event.endTime) : latestLeaveTime;

  if (!actualStartTime || !actualEndTime) {
    return interaction.reply({
      content: "❌ 無法計算活動總時長，缺少必要的時間資訊。",
      ephemeral: true,
    });
  }
  console.log("活動開始時間:", actualStartTime);
  console.log("活動結束時間:", actualEndTime);
  // 計算活動總時長（以分鐘計算，無條件進位）
  const eventDurationMinutes = Math.ceil((actualEndTime - actualStartTime) / (1000 * 60));

  const participantNames = participantData.map(p => {
    // 計算參與度百分比
    const participationRate = Math.min(100, Math.floor((p.totalMinutes / eventDurationMinutes) * 100));
    const logs = p.originalLogs.map(log => {
      return `(${log.j || "無進入"} - ${log.l || "無離開"})`;
    }).join(",\n");
    const modifyedLogs = p.modifyedLogs.map(log => {
      return `(${log.j ? DateTime.fromJSDate(log.j).toFormat("HH:mm:ss") : "無進入"} - ${log.l ? DateTime.fromJSDate(log.l).toFormat("HH:mm:ss") : "無離開"})`;
    }).join(",\n");
    return `${p.name}\n${logs}\n整理後時間\n${modifyedLogs}\n(${p.totalMinutes} 分鐘 參與度${participationRate}%)`;
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
        name: "最早進入的參加者時間",
        value: earliestJoinTime ? earliestJoinTime.toLocaleString() : "無",
        inline: false,
      },
      {
        name: "最後離開的參加者時間",
        value: latestLeaveTime ? latestLeaveTime.toLocaleString() : "無",
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
