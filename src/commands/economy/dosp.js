const { env } = require("../../env");
const {
  Client,
  Interaction,
} = require("discord.js");
const Level = require("../../models/Level");
const SigninLog = require("../../models/SigninLog");
const cooldowns = new Set();
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
    if (interaction.guild.id !== env.DISCORD_GUILD_ID) {
      // 忽略其他伺服器
      // console.log(`interaction.guild.id: ${interaction.guild.id}`);
      // console.log(`env.GUILD_ID: ${env.DISCORD_GUILD_ID}`);
      return;
    }
    // await interaction.deferReply();
    // console.log(interaction.member.id);
    // console.log('cooldowns: ',cooldowns);
    // console.log(`cooldowns.has(${interaction.member.id}): `,cooldowns.has(interaction.member.id));
    // 檢查是否在冷卻中
    if (cooldowns.has(interaction.member.id)) {
      try {
        await interaction.reply(`您已經打卡過了!請做滿一小時再打卡!`);
        return;
      } catch (error) {
        console.log(`🚨 Error creating embed: ${error}`);
      }
      return;
    }
    cooldowns.add(interaction.member.id);
    setTimeout(() => {
      cooldowns.delete(interaction.member.id);
    }, 60 * 60 * 1000);

    // 給予經驗值
    let exp = 100;
    let spHour = 23;
    let replyString = `打卡開始進行Side Project, 獲得 ${exp} SP經驗!`
    let date = new Date();
    let hour = date.getHours();
    // console.log(`hour: ${hour}`);
    // 如果在sp hour 打卡獲得200exp
    if (hour === spHour) {
      exp = 200;
      replyString = `打卡開始進行Side Project,在SP hour打卡經驗值兩倍! 獲得 ${exp} SP經驗!`;
    }
    // => 取得使用者等級資料
    const userLevel = await Level.findOne({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
    });
    userLevel.spExp += exp;
    await userLevel.save().catch((error) => {
      console.log(`🚨 Error saving level: ${error}`);
      return;
    });
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
    //=> 創建一個嵌入式消息
    // console.log(`replyString: ${replyString}`);
    try {
      await interaction.reply(replyString);
      return;
    } catch (error) {
      console.log(`🚨 Error creating embed: ${error}`);
    }
  },

  //base command data
  name: "打卡",
  description: "打卡開始進行Side Project",
  deleted: false, // Boolean
};
