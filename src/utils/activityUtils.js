export const rewardItemKeys = [
  "yellow_duck",
  "melon_badge",
  "memory_chip",
  "sheep_hair",
  "secret_scroll",
  "wisdom_seed",
];
export const levelUpItemKeys = [
  "job_scroll",
  "wisdom_crystal",
  "qigu_egg",
]
export function getActivityRewardItemByParticipationRate(participationRate) {
  if (participationRate <= 0) {
    return ""; // 參與度為 0，無獎勵
  }

  // 根據參與度決定是否發放獎勵
  const chance = Math.random() * 100; // 產生 0-100 的隨機數
  if (participationRate > 50 || chance <= participationRate) {
    // 隨機取得道具
    const randomIndex = Math.floor(Math.random() * rewardItemKeys.length);
    const selectedReward = rewardItemKeys[randomIndex];
    return selectedReward; // 發放獎勵
  }

  return ""; // 未獲得獎勵
}

export function getModifyedLogs(originallogs, eventStartTime, eventEndTime) {
  const modifyedLogs = [];

  for (let index = 0; index < originallogs.length; index++) {
    const log = originallogs[index];
    let joinTime = log.join ? new Date(log.join) : null;
    let leaveTime = log.leave ? new Date(log.leave) : null;
    if( originallogs.length === 1) {
      if (!joinTime && !leaveTime) {
        // 如果只有一筆紀錄，且沒有 join 和 leave，視為沒參加
        continue;
      }
      if (!joinTime) {
        // 如果只有一筆紀錄，且沒有 join，視為一開始就參加
        joinTime = new Date(eventStartTime);
      }
      if (!leaveTime) {
        // 如果只有一筆紀錄，且沒有 leave，視為待到活動結束
        leaveTime = new Date(eventEndTime);
      }
      modifyedLogs.push({
        j: joinTime,
        l: leaveTime,
      });
      continue;
    }
    if(index === 0){
      if(!joinTime && !leaveTime) {
        continue;
      }
      if (!joinTime) {
        if (leaveTime > new Date(eventStartTime)) {
          joinTime = new Date(eventStartTime);
        } else {
          joinTime = leaveTime;
          leaveTime = null;
        }
        modifyedLogs.push({
          j: joinTime,
          l: leaveTime,
        });
        continue;
      }
      modifyedLogs.push({
        j: joinTime,
        l: leaveTime,
      });
      continue;
    }
    if (!joinTime && !leaveTime) {
      // a. join 和 leave 都沒有，視為沒參加
      continue;
    } else if (joinTime && leaveTime) {      
      const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
      if (lastModifyedLog.l) {
        modifyedLogs.push({
          j: joinTime,
          l: leaveTime,
        });
      } else {
        lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間
      }
    } else if (!joinTime && leaveTime) {
      const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
      lastModifyedLog.l = leaveTime; // 更新上一筆的離開時間
    } else if (joinTime && !leaveTime) {
      const lastModifyedLog = modifyedLogs[modifyedLogs.length - 1];
      if (index === originallogs.length - 1) {
        // d. 最後一筆有 join，沒 leave，視為待到活動結束
        if(lastModifyedLog.l){
          leaveTime = new Date(eventEndTime);
          modifyedLogs.push({
            j: joinTime,
            l: leaveTime,
          });
        } else {
          lastModifyedLog.l = new Date(eventEndTime); // 更新上一筆的離開時間
        }
      } else {
        if(lastModifyedLog.l) {
          modifyedLogs.push({
            j: joinTime,
            l: null,
          });
        }
      }
    }
  }
  return modifyedLogs;
}

export function getTotalSecands(modifyedLogs) {
  let totalSeconds = 0;
  for( let i = 0 ; i < modifyedLogs.length; i++) {
    const log = modifyedLogs[i];
    totalSeconds += Math.round((log.l - log.j) / 1000);
  }
  return totalSeconds;
}
const generateSpeakerReward = () => {
  // 隨機選擇一個升級道具
  return levelUpItemKeys[Math.floor(Math.random() * levelUpItemKeys.length)];
}

const generateHostReward = () => {
  // 隨機選擇一個獎勵道具
  return rewardItemKeys[Math.floor(Math.random() * rewardItemKeys.length)];
}
export function generateRewardResults(event) {
  // 計算活動總時長（以分鐘計算，無條件進位）
  const eventDurationMinutes = Math.ceil((event.endTime - event.startTime) / (1000 * 60));
  
  // 準備參與者資料
  const participants = Array.from(event.participants.keys()).map(userId => {
    return {
      id: userId,
      displayName: userId, // 假設 userId 為顯示名稱，實際應根據需要修改
    }
  });
  
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
  });

  const rewardResults = {
    hosts: [],
    speakers: [],
    participants: [],
  };
  
  // 主持人獎勵
  if (event.hostIds && event.hostIds.length > 0) {
    event.hostIds.forEach((hostId) => {
      const rewardData = {
        hostId: hostId,
        reward: generateHostReward(),
        quantity: 3
      }
      rewardResults.hosts.push(rewardData);
    });
  }
  
  event.speakerIds.forEach((speakerId) => {
    const rewardData = {
      speakerId: speakerId,
      reward: generateSpeakerReward(),
    }
    rewardResults.speakers.push(rewardData)
  })
  
  participantData.forEach((user) => {
    const { userId, totalMinutes, participationRate, rewardItem } = user;

    // // 主持人獎勵
    // if (userId === eventId.hostId) {
    //   rewardResults.hosts.push({
    //     hostId: userId,
    //     reward: rewardItem || "無",
    //   });
    // }

    // 參加者獎勵
    rewardResults.participants.push({
      participantId: userId,
      reward: rewardItem || "無",
      participationRate: participationRate || 0,
      totalMinutes: totalMinutes || 0,
    });
  });

  return {
    rewardResults,
    participantData,
    eventDurationMinutes
  };
}
