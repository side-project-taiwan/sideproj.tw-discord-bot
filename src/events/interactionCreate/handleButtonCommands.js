const { Client, Interaction } = require("discord.js");
const { env } = require("../../env");
const handleRoleToggle = require("./button/handleRoleToggle");
const handleShopPurchase = require("./button/handleShopPurchase");
const handleSpLevelUp = require("./button/handleSpLevelUp");
const handleStartEvent = require("./button/handleStartEvent");
const handleEventDetail = require("./button/handleEventDetail");
const handleEndEvent = require("./button/handleEndEvent");
const handleEditEvent = require("./button/handleEditEvent");
const handleUpdateEvent = require("./modalSubmit/handleUpdateEvent");
const handleUpdateEventChannel = require("./channelSelectMenu/handleUpdateEventChannel");
const handleSatteleEventRewards = require("./button/handleSettleEventRewards");
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
  if (interaction.customId.startsWith("settleEventRewards_")) {
    if (!requireEventHost(interaction, "在嘗試發放活動獎勵")) return;
    return handleSatteleEventRewards(client, interaction);
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
