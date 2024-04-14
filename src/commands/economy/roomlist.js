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
      interaction.reply("This command is only available inside servers.");
      return;
    }

    const targetChannel = interaction.options.getChannel("channel");

    // 確保選定的是語音頻道
    if (!targetChannel || targetChannel.type !== 2) {
      await interaction.reply("Please select a valid voice channel.");
      return;
    }

    // 取得該伺服器所有用戶等級資料
    let allUserLevels = await Level.find({
      guildId: interaction.guild.id,
    }).select("-_id userId level xp");

    // 組合成員列表
    const roomList = targetChannel.members
      .map((member) => {
        const userInfo = allUserLevels.find(
          (level) => level.userId === member.id
        );
        return `${member.displayName} (${
          userInfo ? userInfo.level : "N/A"
        }) <:Sheep:1224251953555443812> ${userInfo ? userInfo.xp : "0"}xp`;
      })
      .join("\n");

    await interaction.reply(`Members in ${targetChannel.name}:\n${roomList}`);
  },

  //base command data
  name: "roomlist",
  description: "Shows voice channel members list",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  options: [
    {
      name: "channel",
      description: "Select a voice channel",
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ], // Object[]
  deleted: false, // Boolean
};
