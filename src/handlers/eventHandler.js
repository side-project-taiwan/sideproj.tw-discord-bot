const path = require("path");
const { Client } = require("discord.js");

const getAllFiles = require("../utils/getAllFiles");

/**
 *
 * @param {Client} client
 * @param {'production'|'staging'|'dev'} currentEnv
 */
module.exports = (client, currentEnv = "dev") => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);
  // 歷遍所有的事件資料夾
  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b); // 排序
    // 取得事件資料夾的名稱
    const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

    // HACK: skip guildScheduledEventHook unless is production
    if (
      eventName.startsWith("guildScheduledEvent") &&
      currentEnv !== "production"
    ) {
      continue;
    }

    // 啟動對應 監聽事件 名稱
    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const event = require(eventFile);
        await event(client, ...args);
      }
    });
  }
};
