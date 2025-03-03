const {
  Client,
  Interaction,
} = require("discord.js");
const Level = require("../../models/Level");
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

    const top10users = await Level.find({
      guildId: interaction.guild.id,
    }).sort({ spExp: -1 }).limit(10);
    // console.log('top10users: ',top10users);
    
    const userIds = top10users.map((user) => user.userId);
    const users = await interaction.guild.members.fetch({user: userIds});
    const getRankingIcon = (index, userId) => {
        if(userId === '362797826453012491'){
            return "<:image:1227521779719733280>";
        }
        switch (index) {
        case 0:
            return ":first_place:";
        case 1:
            return ":second_place:";
        case 2:
            return ":third_place:";
        default:
            return "<:Sheep:1224251953555443812>";
        }
    }
    const rankingLabels = top10users.map((top10user, index) => {
        const userInfo = users.find((user) => user.id === top10user.userId);
        return `${index + 1}. ${getRankingIcon(index, top10user.userId)} ${userInfo.displayName}(${top10user.spExp})`;
    });
    await interaction.reply(`Ranking of SP exp:\n ${rankingLabels.join("\n")}`);
  },

  //base command data
  name: "sp-ranking",
  description: "Shows voice channel members list",
};
