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
    // await interaction.deferReply();
    // console.log(interaction.member.id);
    // console.log(cooldowns);
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
    // => 取得使用者等級資料
    const userLevel = await Level.findOne({
      userId: interaction.member.id,
      guildId: interaction.guild.id,
    });
    userLevel.spExp += 100;
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
    try {
      await interaction.reply(`打卡開始進行Side Project, 獲得 100 SP經驗!`);
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
