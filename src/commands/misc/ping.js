const { Client, Interaction } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Ping!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  //   options: [],    // Object[]

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },
};
