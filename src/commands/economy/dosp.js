const { env } = require("../../env");
const { Client, Interaction } = require("discord.js");
const { getOrCreateUser } = require("../../services/level.service");
const Level = require("../../models/Level");
const SigninLog = require("../../models/SigninLog");
const SpExpChange = require("../../models/SpExpChange");
const getTeamMembersInfo = require("../../utils/getTeamMembers");
const generateCheckInImage = require("../../utils/drawTeam");

const SP_HOUR = 23 - 8; // 23:00
const SP_EXP_MAX = 20000;
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("This command is only available inside a servers.");
      return;
    }
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    if (guildId !== env.DISCORD_GUILD_ID) {
      // 忽略其他伺服器
      // console.log(`interaction.guild.id: ${interaction.guild.id}`);
      // console.log(`env.GUILD_ID: ${env.DISCORD_GUILD_ID}`);
      return;
    }
    // await interaction.deferReply();

    // 取得使用者資料
    const userLevel = await getOrCreateUser(userId, guildId);

    // 檢查是否在冷卻中
    console.log("user: ", userLevel);
    // 打卡時間一小時內不可重複打卡
    if (!userLevel) {
      userLevel = new Level({
        userId: interaction.member.id,
        guildId: interaction.guild.id,
        xp: 0,
        level: 0,
        spExp: 0,
        spSigninCooldown: Date.now() + 60 * 60 * 1000,
      });
    } else {
      // 檢查是否已達上限
      if (userLevel.spExp >= SP_EXP_MAX) {
        await interaction.reply(
          `您的經驗值已到達上限${SP_EXP_MAX}，請升級等級後再打卡(進行Side Project分享即可獲得升級道具)`
        );
        return;
      }
      if (userLevel.spSigninCooldown > Date.now()) {
        try {
          // 計算剩餘時間
          const remainingTime = userLevel.spSigninCooldown - Date.now();
          const remainingMinutes = Math.floor(remainingTime / 60000);
          const remainingSeconds = ((remainingTime % 60000) / 1000).toFixed(0);
          await interaction.reply({
            content: `您已經打卡過了!請做滿一小時再打卡!還剩下: ${remainingMinutes}分鐘${remainingSeconds}秒`,
            ephemeral: true,
          })
          return;
        } catch (error) {
          console.log(`🚨 Error creating embed: ${error}`);
        }
        return;
      } else {
        userLevel.spSigninCooldown = Date.now() + 60 * 60 * 1000;
      }
    }
    // 檢查上次打卡團隊加成
    let lastSignin = await SigninLog.findOne({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
    }).sort({ startTime: -1 });
    let sameTimeSignins = 0;
    let imageBuffer = null;
    let teamLogs = [];
    let teamExp = 0;
    if (lastSignin) {
      teamLogs = await SigninLog.find({
        guildId: interaction.guild.id,
        startTime: { $lt: lastSignin.endTime },
        endTime: { $gt: lastSignin.startTime },
      });
      sameTimeSignins = teamLogs.length - 1
      console.log(`sameTimeSignins: ${sameTimeSignins}`);
      if (sameTimeSignins) {
        let multiple = 1;
        //如果打卡時間為23:00，獲得兩倍經驗
        const hr = lastSignin.startTime.getHours();
        console.log(`last signin hr: ${hr}`);
        if (hr === SP_HOUR) {
          multiple = 2;
        }
        teamExp = sameTimeSignins * 5 * multiple;
        userLevel.spExp += teamExp;
      }
      //檢查是否已經計算過團隊加成
      const alreadyCalcLog = await SpExpChange.findOne({
        userId: interaction.member.id,
        guildId: interaction.guild.id,
        signinId: lastSignin._id,
        reason: "teamBonus",
      });
      if (!alreadyCalcLog) {
        const spExpChange = new SpExpChange({
          userId: interaction.member.id,
          guildId: interaction.guild.id,
          signinId: lastSignin._id,
          reason: "teamBonus",
          expChange: teamExp,
          updatedExp: userLevel.spExp,
        });
        await spExpChange.save().catch((error) => {
          console.log(`🚨 Error saving spExpChange: ${error}`);
          return;
        });
      }
    }
    // 給予本次打卡經驗值
    let exp = 100;
    let replyString = `打卡開始進行Side Project, 獲得 ${exp} SP經驗!`;
    let date = new Date();
    let hour = date.getHours();
    // console.log(`hour: ${hour}`);
    // 如果在sp hour 打卡獲得200exp
    console.log(`hour: ${hour}, spHour: ${SP_HOUR}`);
    if (hour === SP_HOUR) {
      exp = 200;
      replyString = `打卡開始進行Side Project,在SP hour打卡經驗值兩倍! 獲得 ${exp} SP經驗!`;
    }
    userLevel.spExp += exp;
    await userLevel.save().catch((error) => {
      console.log(`🚨 Error saving level: ${error}`);
      return;
    });
    if (sameTimeSignins) {
      const userIds = [...new Set(teamLogs.map(log => log.userId.toString()))];
      const teamInfo = await getTeamMembersInfo(userIds, interaction.guild);
      imageBuffer = await generateCheckInImage(teamInfo);
      teamInfo.forEach((user) => {
        console.log(`#${user.name} | Lv.${user.level} | ${user.spExp} SP | ${user.avatar}`);
      });
      replyString += `\n上次打卡組隊人數: ${sameTimeSignins}, 額外獲得團隊加成獎勵 ${teamExp} SP經驗!`;
    }
    // 寫入打卡紀錄
    const signinLog = new SigninLog({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
      startTime: Date.now(),
      endTime: Date.now() + 60 * 60 * 1000,
    });
    await signinLog.save().catch((error) => {
      console.log(`🚨 Error saving signin log: ${error}`);
      return;
    });
    // 寫入經驗值變動紀錄
    const spExpChange = new SpExpChange({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
      signinId: signinLog._id,
      expChange: exp,
      updatedExp: userLevel.spExp,
      reason: "signin",
    });
    await spExpChange.save().catch((error) => {
      console.log(`🚨 Error saving spExpChange: ${error}`);
      return;
    });
    //=> 創建一個嵌入式消息
    // console.log(`replyString: ${replyString}`);
    const replyPayload = {
      content: replyString,
    };

    if (imageBuffer) {
      replyPayload.files = [{ attachment: imageBuffer, name: "team.png" }];
    }

    try {
      await interaction.reply(replyPayload);
      return;
    } catch (error) {
      console.log(`🚨 Error creating embed: ${error}`);
    }
    return;
  },

  //base command data
  name: "打卡",
  description: "打卡開始進行Side Project",
  deleted: false, // Boolean
};
