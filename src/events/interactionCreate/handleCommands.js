const { Client, Interaction } = require("discord.js");

const { testServer, devs } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommand = getLocalCommands();

  try {
    const commandObject = localCommand.find(
      (command) => command.name === interaction.commandName
    );
    if (!commandObject) return;

    // 檢測是否為只提供給開發者
    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "This command is for developers only.",
          ephemeral: true,
        });
        return;
      }
    }

    // 檢測是否為只提供給測試伺服器
    if (commandObject.testOnly) {
      if (!(interaction.guild.id === testServer)) {
        interaction.reply({
          content: "This command cannot be ran here.",
          ephemeral: true,
        });
        return;
      }
    }

    // 檢測使用者是否有權限
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: `Not enough permissions.`,
            ephemeral: true,
          });
          break;
        }
      }
    }

    // 檢測機器人是否有權限
    if (commandObject.botPermissions?.length) {
        for(const permission of commandObject.botPermissions){
            const bot = interaction.guild.members.me;
            if (!bot.permissions.has(permission)) {
                interaction.reply({
                    content: `I don't have enough permissions.`,
                    ephemeral: true,
                });
                break;
            }
        }
    }

    // Run the command
    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(
      `🚨 [handleCommands] There was an error running this command: ${error}`
    );
  }
};
