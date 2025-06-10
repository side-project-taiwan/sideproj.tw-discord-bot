const { Client, Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
  /**
   * 
   * @param {Client} client 
   * @param {Interaction} interaction 
   */
  callback: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("指令總覽")
      .setDescription("歡迎使用 Side Project Taiwan Bot！")
      .setColor(0xFFFFFF)
      .addFields(
        { name: "**/每日簽到**", value: "簽到並領取活動里程，未來可兌換活動！" },
        { name: "**/打卡**", value: "打卡進行 side project！獲得里程" },
        { name: "**/冒險卡**", value: "查看自己的冒險資料卡" },
        { name: "**/level [User]**", value: "查看自己/他人的等級卡" },
        { name: "**/sp-ranking**", value: "查看你的等級排序和活躍狀態" }
      )

      .setFooter({
        text: "\nSide Project Taiwan Bot | 支援更多功能開發中",
      });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
  name: "help",
  description: "顯示所有可用的指令",
  deleted: false,
};
