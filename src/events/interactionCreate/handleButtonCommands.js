const { Client, Interaction } = require("discord.js");

const handleRoleToggle = require('./button/handleRoleToggle');
const handleShopPurchase = require('./button/handleShopPurchase');

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('shop_')) {
    return handleShopPurchase(client, interaction);
  }

  // 預設：嘗試把 customId 當作 roleId 使用
  return handleRoleToggle(client, interaction);
};
