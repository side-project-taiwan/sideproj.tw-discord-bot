const { Client, Interaction } = require("discord.js");
const { env } = require("../../env");
const handleRoleToggle = require("./button/handleRoleToggle");
const handleShopPurchase = require("./button/handleShopPurchase");
const handleSpLevelUp = require("./button/handleSpLevelUp");
const handleStartEvent = require("./button/handleStartEvent");
const handleEventDetail = require("./button/handleEventDetail");
const handleEndEvent = require("./button/handleEndEvent");
const handleEditEvent = require("./button/handleEditEvent");
const handleEditEventHosts = require("./button/handleEditEventHosts");
const handleEditEventSpeakers = require("./button/handleEditEventSpeakers");
const handleEditEventChannel = require("./button/handleEditEventChannel");
const handleUpdateEvent = require("./modalSubmit/handleUpdateEvent");
const handleUpdateEventChannel = require("./channelSelectMenu/handleUpdateEventChannel");
const handleUpdateEventHosts = require("./userSelectMenu/handleUpdateEventHosts");
const handleUpdateEventSpeakers = require("./userSelectMenu/handleUpdateEventSpeakers");
const handleSatteleEventRewards = require("./button/handleSettleEventRewards");
const handleDoSettleRewards = require("./button/handleDoSettleRewards");
const handleResendRewardMessage = require("./button/handleResendRewardMessage");
/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  console.log(`收到互動：${interaction.customId} 來自 ${interaction.user.tag}`);
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("updateEvent_")) {
      if (!requireEventHost(interaction, "在嘗試查看活動")) return;
      return handleUpdateEvent(client, interaction);
    }
  }
  if (interaction.isChannelSelectMenu()) {
    if (interaction.customId.startsWith("updateEventChannel_")) {
      if (!requireEventHost(interaction, "在嘗試查看活動")) return;
      return handleUpdateEventChannel(client, interaction);
    }
  }
  if (interaction.isUserSelectMenu()) {
    if (interaction.customId.startsWith("updateEventHosts_")) {
      if (!requireEventHost(interaction, "在嘗試更新活動主持人")) return;
      return handleUpdateEventHosts(client, interaction);
    }
    if (interaction.customId.startsWith("updateEventSpeakers_")) {
      if (!requireEventHost(interaction, "在嘗試更新活動分享者")) return;
      return handleUpdateEventSpeakers(client, interaction);
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
    if (!requireEventHost(interaction, "在嘗試啟動活動")) return;
    return handleStartEvent(client, interaction);
  }

  if (interaction.customId.startsWith("eventDetail_")) {
    if (!requireEventHost(interaction, "在嘗試查看活動資訊")) return;
    return handleEventDetail(client, interaction);
  }
  if (interaction.customId.startsWith("endEvent_")) {
    if (!requireEventHost(interaction, "在嘗試結束活動")) return;
    return handleEndEvent(client, interaction);
  }
  if (interaction.customId.startsWith("editEvent_")) {
    if (!requireEventHost(interaction, "在嘗試編輯活動")) return;
    return handleEditEvent(client, interaction);
  }
  if (interaction.customId.startsWith("editEventHosts_")) {
    if (!requireEventHost(interaction, "在嘗試更改活動主持人")) return;
    return handleEditEventHosts(client, interaction);
  }
  if (interaction.customId.startsWith("editEventSpeakers_")) {
    if (!requireEventHost(interaction, "在嘗試更改活動講者")) return;
    return handleEditEventSpeakers(client, interaction);
  }
  if (interaction.customId.startsWith("editEventChannel_")) {
    if (!requireEventHost(interaction, "在嘗試更改活動頻道")) return;
    return handleEditEventChannel(client, interaction);
  }
  if (interaction.customId.startsWith("settleEventRewards_")) {
    if (!requireEventHost(interaction, "在嘗試發放活動獎勵")) return;
    return handleSatteleEventRewards(client, interaction);
  }
  if (interaction.customId.startsWith("doSettleRewards_")) {
    if (!requireEventHost(interaction, "在嘗試執行獎勵發放")) return;
    return handleDoSettleRewards(client, interaction);
  }
  if (interaction.customId.startsWith("handleResendRewardMessage_")) {
    if (!requireEventHost(interaction, "在嘗試重發獎勵通知")) return;
    return handleResendRewardMessage(client, interaction);
  }

  // 預設：嘗試把 customId 當作 roleId 使用
  return handleRoleToggle(client, interaction);
};

/**
 * 判斷使用者是否具有活動主持人身分組
 * @param {Interaction} interaction
 * @returns {boolean}
 */
function requireEventHost(interaction, msg = "嘗試使用活動功能") {
  const isHost = interaction.member?.roles?.cache?.has(env.roles.eventHost);
  if (!isHost) {
    console.log(
      `❌ [權限拒絕] 使用者 [${interaction.user.displayName}] ${msg}`
    );
    return false;
  }
  return true;
}
