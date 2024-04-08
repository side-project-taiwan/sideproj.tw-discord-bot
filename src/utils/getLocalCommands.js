const path = require("path");
const getAllFiles = require("./getAllFiles");
module.exports = (exceptions = []) => {
  let localCommands = [];
  const commandCategories = getAllFiles(
    path.join(__dirname, "..", "commands"),
    true
  );
  // 歷遍所有的指令資料夾
  for (const commandCategory of commandCategories) {
    //
    const commandFiles = getAllFiles(commandCategory);
    // 啟動所有的指令檔案
    for (const commandFile of commandFiles) {
      const commandObject = require(commandFile);
      if (exceptions.includes(commandObject.name)) {
        continue;
      }
      localCommands.push(commandObject);
    }
  }
  return localCommands;
};
