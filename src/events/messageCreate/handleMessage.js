const { Client, Message, EmbedBuilder } = require("discord.js");

const { testServer, devs } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (message.author.bot) return;
  // console.log(
  //   `Message from ${message.channel.name}, ${message.author.displayName}:${message.content}`
  // );
  try {
    const { content } = message;
    if (content === "hello") {
      message.reply("hello");
      return;
    }
    // embed
    if (content === "embed") {
      const embed = new EmbedBuilder()
        .setTitle("This is an embed")
        .setDescription("This is a test embed")
        .setColor("Random")
        .addFields(
          { name: "Field title", value: "Some valse", inline: true },
          { name: "Field title", value: "Some valse", inline: true }
        );
      //# Will @user and reply to the message
      // message.reply({
      //   embeds: [embed],
      // });

      //# Will only send the embed
      message.channel.send({
        embeds: [embed],
      });
      return;
    }
  } catch (error) {
    console.log(
      `🚨 [handleMessage] There was an error running this command: ${error}`
    );
  }
};
