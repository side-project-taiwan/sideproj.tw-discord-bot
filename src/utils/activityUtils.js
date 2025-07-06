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
export function generateRewardResults(participantData, event) {
  const rewardResults = {
    hosts: [],
    speakers: [],
    participants: [],
  };
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

    // // 分享者獎勵
    // if (eventId.speakerIds.includes(userId)) {
    //   rewardResults.sharers.push({
    //     sharerId: userId,
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

  return rewardResults;
}
