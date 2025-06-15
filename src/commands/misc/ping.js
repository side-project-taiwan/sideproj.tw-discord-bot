const { Client, Interaction } = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    try {
      interaction.reply(`Pong! ${client.ws.ping}ms`);
    } catch (error) {
      console.log(
        `🚨 [Ping Commands] There was an error running this command: ${error}`
      );
    }
  },

  //base command data
  name: "ping",
  description: "Ping!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  //   options: [],    // Object[]
  deleted: false, // Boolean
};
