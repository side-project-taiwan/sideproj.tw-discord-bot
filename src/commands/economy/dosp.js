const { env } = require("../../env");
const { Client, Interaction } = require("discord.js");
const { getOrCreateUser } = require("../../services/level.service");
const Level = require("../../models/Level");
const SigninLog = require("../../models/SigninLog");
const SpExpChange = require("../../models/SpExpChange");
const getTeamMembersInfo = require("../../utils/getTeamMembers");
const { generateCheckInImage } = require("../../utils/drawTeam");

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
      return;
    }

    // 取得使用者資料
    let userLevel = await getOrCreateUser(userId, guildId);

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
      if (userLevel.spExp >= SP_EXP_MAX) {
        await interaction.reply(
          `您的經驗值已到達上限${SP_EXP_MAX}，請升級等級後再打卡(進行Side Project分享即可獲得升級道具)`
        );
        return;
      }
      if (userLevel.spSigninCooldown > Date.now()) {
        try {
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
      }
      userLevel.spSigninCooldown = Date.now() + 60 * 60 * 1000;
    }

    let exp = 100;
    let replyString = `打卡開始進行Side Project, 獲得 ${exp} SP經驗!`;
    const date = new Date();
    const hour = date.getHours();
    if (hour === SP_HOUR) {
      exp = 200;
      replyString = `打卡開始進行Side Project,在SP hour打卡經驗值兩倍! 獲得 ${exp} SP經驗!`;
    }
    userLevel.spExp += exp;

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

    const teamLogs = await SigninLog.find({
      guildId: interaction.guild.id,
      startTime: { $lt: signinLog.endTime },
      endTime: { $gt: signinLog.startTime },
    });

    let userIds = [...new Set(teamLogs.map((log) => log.userId.toString()))];
    if (userIds.length > 1) {
      const hr = signinLog.startTime.getHours();
      const multiple = hr === SP_HOUR ? 2 : 1;
      const bonus = 5 * multiple;
      for (const uid of userIds) {
        const teammate = await getOrCreateUser(uid, guildId);
        if (!teammate) continue;
        if (uid === interaction.member.id) {
          const teamBonus = bonus * (userIds.length - 1)
          await SpExpChange.create({
            userId: uid,
            guildId,
            signinId: signinLog._id,
            expChange: teamBonus,
            updatedExp: teammate.spExp + teamBonus,
            reason: "teamBonus",
          });
          userLevel.spExp += teamBonus;
        } else {
          teammate.spExp += bonus;
          await teammate.save();  
          await SpExpChange.create({
            userId: uid,
            guildId,
            signinId: signinLog._id,
            expChange: bonus,
            updatedExp: teammate.spExp,
            reason: "teamBonus",
          });
        }
      }
    }

    await userLevel.save().catch((error) => {
      console.log(`🚨 Error saving level: ${error}`);
      return;
    });

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
    const teamInfo = await getTeamMembersInfo(userIds, interaction.guild);
    let imageBuffer = null;
    imageBuffer = await generateCheckInImage(teamInfo, userIds.length);

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

  name: "打卡",
  description: "打卡開始進行Side Project",
  deleted: false,
};
