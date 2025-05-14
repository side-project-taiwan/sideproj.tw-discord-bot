const { Client, Interaction } = require("discord.js");
const { roles } = require("../../../config.json");
const handleRoleToggle = require("./button/handleRoleToggle");
const handleShopPurchase = require("./button/handleShopPurchase");
const handleSpLevelUp = require("./button/handleSpLevelUp");
/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("shop_")) {
    return handleShopPurchase(client, interaction);
  }
  if (interaction.customId.startsWith("spup_")) {
    return handleSpLevelUp(client, interaction);
  }

  if (interaction.customId.startsWith("startEvent_")) {
    if (!interaction.member.roles.cache.has(roles.eventHost)) {
      return console.log(
        `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試啟動活動`
      );
    }
    return console.log(interaction.customId);
  }

  // 預設：嘗試把 customId 當作 roleId 使用
  return handleRoleToggle(client, interaction);
};
