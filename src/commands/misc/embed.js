const { Client, Interaction, EmbedBuilder } = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("This is an embed")
      .setDescription("This is a test embed")
      .setColor("Random")
      .addFields(
        { name: "Field title", value: "Some valse", inline: true },
        { name: "Field title", value: "Some valse", inline: true }
      );
    // interaction.channel.send({embeds: [embed]});
    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },

  //base command data
  name: "embed",
  description: "Bot reply embed!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  //   options: [],    // Object[]
  deleted: false, // Boolean
};
