const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const calculateLevelXp = require("../../utils/calculateLevelXp");

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

    const mentionedUserId = interaction.options.get("target-user");
    const targetUserId = mentionedUserId?.value || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    //=> 取得使用者等級資料
    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    //=> 檢查用戶是否有等級
    if (!fetchedLevel) {
      interaction.reply({
        context: mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any level yet.`
          : "You don't have any level yet.",
        ephemeral: true,
      });
      return;
    }

    //=> 獲取所有使用者等級
    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      "-_id userId level xp"
    );
    //=> 按等級和經驗值排序
    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });
    //=> 當前排名
    let currentRank =
      allLevels.findIndex((level) => level.userId === targetUserId) + 1; // +1 because array index starts from 0

    //=> 創建一個嵌入式消息
    try {
      const levelEmbed = new EmbedBuilder()
        .setColor("#f47fff") // 设置embed颜色
        .setTitle("等級卡") // 设置embed标题
        .setDescription(`這是 <@${fetchedLevel.userId}> 的等級資料。`) // 描述中可以提及用户
        .addFields(
          { name: "等级", value: fetchedLevel.level.toString(), inline: true },
          { name: "經驗", value: fetchedLevel.xp.toString(), inline: true },
          { name: "排名", value: currentRank.toString(), inline: true },
          // {
          //   name: "符號",
          //   value: "<:ExpressJs:1226458365266231357>",
          //   inline: false,
          // },
          {
            name: "下一级所需經驗值",
            value: (
              calculateLevelXp(fetchedLevel.level) - fetchedLevel.xp
            ).toString(),
            inline: true,
          }
        )
        .setAuthor({
          name: targetUserObj.displayName,
          iconURL: targetUserObj.displayAvatarURL(),
        })
        .setTimestamp() // 在embed中添加时间戳
        .setFooter({
          text: "等级系统",
          iconURL:
            "https://cdn.discordapp.com/emojis/1320147939561046176.webp?size=240",
        }); // 底部的文字和图标

      // 在频道中发送embed消息
      await interaction.reply({ embeds: [levelEmbed], ephemeral: true });
      return;
    } catch (error) {
      console.log(`🚨 Error creating embed: ${error}`);
    }
  },

  //base command data
  name: "level",
  description: "Shows your/someone's level",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  options: [
    {
      name: "target-user",
      description: "The user whose level you want to see.",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ], // Object[]
  deleted: false, // Boolean
};
