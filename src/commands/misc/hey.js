const { Client, Interaction } = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    interaction.reply("hey!");
  },

  //base command data
  name: "hey",
  description: "Say hey to bot!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  //   options: [],    // Object[]
  deleted: false, // Boolean
};
