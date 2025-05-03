const { env } = require("../../env");
const { Client, Interaction } = require("discord.js");
const Level = require("../../models/Level");
const CheckIn = require("../../models/CheckIn");
const { StreakRewardByDay } = require("../../enums/streak.enum");
const { getOrCreateUser } = require("../../services/level.service");
const { initCheckIn } = require("../../services/checkIn.service");
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
    
    /**
     * @type {CheckIn | undefined}
     */
    let checkIn = await CheckIn.findOne({ userId, guildId });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (
      !checkIn ||
      !checkIn.lastCheckInTime ||
      checkIn.lastCheckInTime < startOfToday
    ) {
      if (!checkIn) {
        checkIn = await initCheckIn(userId, guildId);
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      if (checkIn.lastCheckInTime >= yesterday) {
        // 連續簽到
        checkIn.streak = (checkIn.streak || 0) + 1;
      } else {
        // 中斷或第一次
        checkIn.streak = 1;
      }

      checkIn.lastCheckInTime = new Date();

      // 設定 每次簽到的獎勵區 //
      const mileageReward = 100;
      const activityReward = 1000;
      const streak = checkIn.streak;
      let mileageTotalReward = mileageReward;
      let activityTotalReward = activityReward;
      if (streak > 1) {
        mileageTotalReward = mileageReward + Math.min((streak - 1) * 10, 200); // 每天多10，最多加到+200
        activityTotalReward =
          activityReward + Math.min((streak - 1) * 100, 2000); // 活躍值依天數增加
      }
      const streakReward = StreakRewardByDay[streak];
      let extraMileage = 0;
      let extraReplyMsg;
      if (streakReward) {
        extraReplyMsg = `\n\n${streakReward.message}`;
        extraMileage += streakReward.mileage;
      }

      //===================//
      // 發放獎勵
      userLevel.mileage += mileageTotalReward;
      userLevel.activity += activityTotalReward;
      if (extraMileage) userLevel.mileage += extraMileage;

      // 儲存變更
      await checkIn.save().catch((error) => {
        console.log(`🚨 Error saving checkIn: ${error}`);
        return;
      });
      await userLevel.save().catch((error) => {
        console.log(`🚨 Error saving level: ${error}`);
        return;
      });

      const user = await interaction.guild.members.fetch({
        user: interaction.member.id,
      });

      //=> 創建一個嵌入式消息
      try {
        console.log(
          `user: ${user.displayName} [ activity: ${userLevel.activity}, mileage: ${userLevel.mileage} ]`
        );

        await interaction.reply({
          content: `🏕️ 你邁出了今日的冒險第一步！\n\n🎁 獎勵內容：\n🔥 活躍值 +${activityTotalReward}\n🛤️ 里程　 +${mileageTotalReward}\n🏅 你已連續簽到 **${
            checkIn.streak
          } 天**！ ${extraReplyMsg ?? ""}`,
          ephemeral: true, // ✅ 私人訊息，只顯示給觸發指令的人
        });

        const channelID = "1367522119818285188"; // 冒險者日誌
        const activityLogChannel =
          interaction.client.channels.cache.get(channelID);

        if (activityLogChannel && activityLogChannel.isTextBased()) {
          const displayTime = formatTaiwanTime(new Date());
          await activityLogChannel.send(
            `${displayTime} ✨【 ${user.displayName} 】已完成每日簽到！🏅`
          );
          if (streakReward)
            await activityLogChannel.send(
              `🎉 恭喜 **${user.displayName}** 已連續簽到 **${streak} 天**！獲得額外 **${extraMileage} 里程** 🎁`
            );
        }
        return;
      } catch (error) {
        console.log(`🚨 Error creating embed: ${error}`);
      }
    } else {
      // ❌ 已簽到
      await interaction.reply({
        content: "⚠️ 你今天已經簽到過了，明天再來吧！",
        ephemeral: true, // ✅ 私人訊息，只顯示給觸發指令的人
      });
    }
  },

  //base command data
  name: "每日簽到",
  description: "每日簽到，可以提升活躍值跟里程",
  deleted: false, // Boolean
};

function formatTaiwanTime(date) {
  const formatter = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei", // ✅ 明確指定台灣時區
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23", // ✅ 指定 24 小時制，避免出現 24:00 或上午下午
  });

  return formatter.format(date);
}
