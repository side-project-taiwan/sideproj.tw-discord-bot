const { Client, Interaction } = require("discord.js");
const { roles } = require("../../../config.json");
const handleRoleToggle = require("./button/handleRoleToggle");
const handleShopPurchase = require("./button/handleShopPurchase");
const handleSpLevelUp = require("./button/handleSpLevelUp");
const handleStartEvent = require("./button/handleStartEvent");
const handleEventDetail = require("./button/handleEventDetail");
const handleEndEvent = require("./button/handleEndEvent");
const handleEditEvent = require("./button/handleEditEvent");
const handleUpdateEvent = require("./modalSubmit/handleUpdateEvent");
const handleUpdateEventChannel = require("./channelSelectMenu/handleUpdateEventChannel");
/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  console.log(`收到互動：${interaction.customId} 來自 ${interaction.user.tag}`);
  if(interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("updateEvent_")) {
      if (!interaction.member.roles.cache.has(roles.eventHost)) {
        return console.log(
          `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試查看活動`
        );
      }
      return handleUpdateEvent(client, interaction);
    }
  }
  if(interaction.isChannelSelectMenu()) {
    if (interaction.customId.startsWith("updateEventChannel_")) {
      if (!interaction.member.roles.cache.has(roles.eventHost)) {
        return console.log(
          `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試查看活動`
        );
      }
      return handleUpdateEventChannel(client, interaction);
    }
  }
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
    return handleStartEvent(client, interaction);
  }

  if (interaction.customId.startsWith("eventDetail_")) {
    if (!interaction.member.roles.cache.has(roles.eventHost)) {
      return console.log(
        `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試查看活動`
      );
    }
    return handleEventDetail(client, interaction);
  }
  if (interaction.customId.startsWith("endEvent_")) {
    if (!interaction.member.roles.cache.has(roles.eventHost)) {
      return console.log(
        `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試查看活動`
      );
    }
    return handleEndEvent(client, interaction);
  }
  if (interaction.customId.startsWith("editEvent_")) {
    if (!interaction.member.roles.cache.has(roles.eventHost)) {
      return console.log(
        `沒有權限的 [${interaction.user.displayName}] 使用者在嘗試查看活動`
      );
    }
    return handleEditEvent(client, interaction);
  }

  // 預設：嘗試把 customId 當作 roleId 使用
  return handleRoleToggle(client, interaction);
};
