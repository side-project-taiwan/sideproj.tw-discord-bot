const { Client } = require("discord.js");
const { env } = require("../../env");

const getLocalCommands = require("../../utils/getLocalCommands");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      env.DISCORD_GUILD_ID
    );

    // 歷遍本地指令
    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;
      // 檢查指令是否有相同的指令在伺服器上
      const existingCommand = applicationCommands.cache.find(
        (command) => command.name === name
      );
      // 如果有相同的指令
      if (existingCommand) {
        // 本地指令設定為「刪除」
        if (localCommand.deleted) {
          // 刪除伺服器上的指令
          applicationCommands.delete(existingCommand.id);
          console.log(`🗑️ Deleted command ${name}`);
          continue;
        }
        if (areCommandsDifferent(existingCommand, localCommand)) {
          // 更新伺服器上的指令
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(`🔄 Edited command ${name}`);
        }
      } else {
        if (localCommand.deleted) {
          //skipping
          console.log(
            `🚫 Skipping registering command "${name}" as it's set to deleted`
          );
          continue;
        }
        applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(`🆕 Registered command "${name}".`);
      }
    }
  } catch (error) {
    console.log(`🚨 [01registerCommands] There was an error ${error}`);
  }
};
