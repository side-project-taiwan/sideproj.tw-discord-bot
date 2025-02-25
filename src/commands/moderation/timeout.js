const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const mentionable = interaction.options.getMentionable("target-user");
    const duration = interaction.options.getString("duration"); // 30m, 1h, 1day
    const reason =
      interaction.options.getString("reason")?.value || "No reason provided";
    console.log(
      `Time-Out: 對象: "${mentionable?.user?.username}", 禁言時間: ${duration}, \n原因: ${reason}`,
      reason
    );
    await interaction.deferReply();

    await iTimeoutMyselfForMyBadIntentions(interaction);

    return;

    //=> get user object
    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("That user does not exist in this server!");
      return;
    }

    //=> check if the target user is bot
    if (targetUser.user.bot) {
      await interaction.editReply("You cannot timeout a bot!");
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply("Please provide a valid timeout duration!");
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply(
        "Timeout duration must be between 5 seconds and 28 days!"
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // 會員的最高角色位置
    const requestUserRolePosition = interaction.member.roles.highest.position; // 請求的最高角色位置
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // 機器人的最高角色位置

    // 對象角色位置 >= 請求角色位置
    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You cannot timeout a user with a higher or equal role!"
      );
      return;
    }

    // 對象角色位置 >= 機器人角色位置
    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I cannot timeout a user with a higher or equal role!"
      );
      return;
    }

    // timeout the Target User
    try {
      const { default: prettyMs } = await import("pretty-ms");

      //=> 已被禁言
      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(
          `${targetUser}'s timeout has been update to: ${prettyMs(msDuration, {
            verbose: true,
          })}`
        );
        return;
      }
      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(
        `${targetUser} was timed out for ${prettyMs(msDuration, {
          verbose: true,
        })}.\nReason: ${reason}`
      );
    } catch (error) {
      console.log(`🚨 There was an error when timeout: ${error}`);
    }
  },

  name: "timeout",
  description: "Timeout a user",
  options: [
    {
      name: "target-user",
      description: "The user you want to timeout.",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "duration",
      description: "Timeout duration (30m, 1h, 1day).",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reason",
      description: "The reason for timeout.",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};

// HACK: ad-hoc function to timeout user who invoked the command
/**
 *
 * @param {*} interaction The context of the interaction
 * @returns
 */
const iTimeoutMyselfForMyBadIntentions = async (interaction) => {
  // timeout myself
  const reason = "I'm sorry for my bad intentions!";
  const msDuration = ms("10s");
  const targetUser = interaction.member;
  try {
    const { default: prettyMs } = await import("pretty-ms");
    await interaction.editReply(
      `${targetUser} was timed out for ${prettyMs(msDuration, {
        verbose: true,
      })}.\nReason: ${reason}`
    );
    await targetUser.timeout(msDuration, reason);
  } catch (error) {
    console.log(`🚨 There was an error when timeout: ${error}`);
  }
};
