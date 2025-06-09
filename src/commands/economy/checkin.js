const { env } = require("../../env");
const { Client, Interaction } = require("discord.js");
const Level = require("../../models/Level");
const CheckIn = require("../../models/CheckIn");
const { getOrCreateUser } = require("../../services/level.service");
const { initCheckIn } = require("../../services/checkIn.service");
const {
  getNextStreakInfo,
  getStreakRewardResult,
} = require("../../services/streak.service");
const {
  env: { channels },
} = require("../../env");

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
    const user = await interaction.guild.members.fetch(userId);
    const isBoosting = !!user.premiumSince;
    const boostMultiplier = isBoosting ? 2 : 1;
    let footerContext = {};
    if (isBoosting) {
      footerContext = {
        text: `你是伺服器贊助者！本次簽到獎勵已套用 x${boostMultiplier} 倍加成 ✨`,
        iconURL:
          "https://cdn.discordapp.com/emojis/992112231561056326.webp?size=240",
      };
    } else {
      footerContext = {
        text: `贊助專屬｜加入伺服器贊助者，即可享有每日簽到 x${boostMultiplier} 倍獎勵加成 🎁`,
        iconURL:
          "https://cdn.discordapp.com/emojis/1319734666743255130.webp?size=240",
      };
    }
    const userLevel = await getOrCreateUser(userId, guildId);
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
      if (isBoosting) {
        mileageTotalReward *= boostMultiplier;
        activityTotalReward *= boostMultiplier;
      }

      const rewardResult = getStreakRewardResult(
        streak,
        isBoosting,
        boostMultiplier
      );
      const extraReplyMsg = rewardResult?.message ?? "";
      const extraMileage = rewardResult?.mileage ?? 0;

      const nextRewardInfo = getNextStreakInfo(streak);
      const nextHint =
        !extraReplyMsg && nextRewardInfo?.hint ? nextRewardInfo.hint : "";

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

      //=> 創建一個嵌入式消息
      try {
        console.log(
          `✅ 簽到紀錄 user: ${user.displayName}(${userId}) [ 活躍值: ${userLevel.activity}, 里程: ${userLevel.mileage} ]  (🔥 ${activityTotalReward}, 🛤️ ${mileageTotalReward}, 🎁 ${extraMileage})`
        );
        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
          .setTitle("🏕️ 你邁出了今日的冒險第一步！")
          .setColor(0x00ccff)
          .setDescription(
            [
              `🎁 **獎勵內容**`,
              `🔥 活躍值 +${activityTotalReward}`,
              `🛤️ 里程　 +${mileageTotalReward}`,
              `🏅 你已連續簽到 **${checkIn.streak} 天**！`,
              `${extraReplyMsg || nextHint || ""}`,
            ]
              .filter(Boolean)
              .join("\n")
          )
          .setFooter(footerContext)
          .setTimestamp();

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });

        const activityLogChannel = interaction.client.channels.cache.get(
          channels.adventureLog
        );

        if (activityLogChannel && activityLogChannel.isTextBased()) {
          const displayTime = formatTaiwanTime(new Date());
          await activityLogChannel.send(
            `${displayTime} ✨【 <@${userId}> 】已完成每日簽到！🏅`
          );
          if (rewardResult)
            await activityLogChannel.send(
              `🎉 恭喜 <@${userId}> 已連續簽到 **${streak} 天**！獲得額外 **${extraMileage} 里程** 🎁`
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
