const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("target-user");
    const reason = interaction.options.get("reason") || "No reason provided";

    await interaction.deferReply();
    const targetUser = await interaction.guild.members.fetch(targetUserId);
    if (!targetUser) {
      await interaction.editReply("That user does not exist in this server!");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("You cannot ban the owner of the server!");
      return;
    }
    const targetUserRolePosition = targetUser.roles.highest.position; // 會員的最高角色位置
    const requestUserRolePosition = interaction.member.roles.highest.position; // 請求的最高角色位置
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // 機器人的最高角色位置

    // 對象角色位置 >= 請求角色位置
    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You cannot ban a user with a higher or equal role!"
      );
      return;
    }

    // 對象角色位置 >= 機器人角色位置
    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I cannot ban a user with a higher or equal role!"
      );
      return;
    }

    // Ban the Target User
    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `User ${targetUser} was banned\nReason: ${reason}`
      );
    } catch (error) {
      console.log(`🚨 There was an error when banning: ${error}`);
    }
  },

  //base command data
  name: "ban",
  description: "Bans a member from this server!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  deleted: true, // Boolean
  options: [
    {
      name: "target-user",
      description: "The user to ban.",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "The reason for banning.",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ], // Object[]

  // 權限控制
  permissionRequired: [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.BanMembers,
  ],
  botPermissions: [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.BanMembers,
  ],
};
