const { Client, Interaction } = require("discord.js");

const { testServer, devs } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  try {
    //step 取得 dc guild role
    const role = interaction.guild.roles.cache.get(interaction.customId);
    // await interaction.deferReply();
    if (!role) {
      interaction.reply({
        content: "I couldn't find that role",
        ephemeral: true, // 只有該使用者可以看到
      });
      return;
    }
    //step 檢查該使用者是否有 role
    const hasRole = interaction.member.roles.cache.has(role.id);
    if (hasRole) {
      await interaction.member.roles.remove(role);
      await interaction.reply({
        content: `The role ${role.name} has been removed`,
        ephemeral: true, // 只有該使用者可以看到
      });
      return;
    } else {
      await interaction.member.roles.add(role);
      await interaction.reply({
        content: `The role ${role.name} has been added`,
        ephemeral: true, // 只有該使用者可以看到
      });
      return;
    }
  } catch (error) {
    console.log(`🚨 There was a buttons 控制 error ${error}`);
  }
};
