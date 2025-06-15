const path = require("path");
const { Client } = require("discord.js");
const { env } = require("../env");
const getAllFiles = require("../utils/getAllFiles");

/** 非 production 時會被略過 */
const prodOnlyEvents = ["guildScheduledEvent"];

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);
  // 歷遍所有的事件資料夾
  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b); // 排序
    // 取得事件資料夾的名稱
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
    // 這些事件在非 production 時會被略過
    if (prodOnlyEvents.includes(eventName) && env.ENV !== "production") {
      continue;
    }

    // 啟動對應 監聽事件 名稱
    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const event = require(eventFile);
        try {
          await event(client, ...args);
        } catch (error) {
          console.log(
            `🚨 [eventHandlerError] There was an error running ${eventName}: ${error}`
          );
        }
      }
    });
  }
};
