const { Client, Message } = require("discord.js");
const Level = require("../../models/Level");
const calculateLevel = require("../../utils/calculateLevelXp");

// 冷卻機制
const cooldowns = new Set();

function getRandomXp(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (
    !message.inGuild() || // 檢查是否在伺服器中
    message.author.bot || // 檢查是否為機器人
    cooldowns.has(message.author.id) // 檢查是否在冷卻中
  )
    return;

  // 給予經驗值(隨機)
  const xpToGive = getRandomXp(5, 15);
  const query = {
    userId: message.author.id,
    guildId: message.guild.id,
  };

  try {
    const level = await Level.findOne(query);
    // 如果有找到該用戶的等級
    if (level) {
      level.xp += xpToGive;
      if (level.xp > calculateLevel(level.level)) {
        level.xp = 0;
        level.level += 1;
        message.channel.send(
          `Congrats ${message.author} you've leveled up to level ${level.level}`
        );
      }

      await level.save().catch((error) => {
        console.log(`🚨 Error saving level: ${error}`);
        return;
      });
      //! 冷卻機制
      //   cooldowns.add(message.author.id);
      //   setTimeout(() => {
      //     cooldowns.delete(message.author.id);
      //   }, 60000);
    }
    // 如果沒有找到該用戶的等級 (初始化)
    else {
      //create new level
      const newLevel = new Level({
        userId: message.author.id,
        guildId: message.guild.id,
        xp: xpToGive,
      });

      newLevel.save().catch((error) => {
        console.log(`🚨 Error saving new level: ${error}`);
        return;
      });
      //! 冷卻機制
      //   cooldowns.add(message.author.id);
      //   setTimeout(() => {
      //     cooldowns.delete(message.author.id);
      //   }, 60000);
    }
  } catch (error) {
    console.log(`🚨 Error giving xp: ${error}`);
  }
};
