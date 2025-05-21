const { Client, VoiceState } = require("discord.js");

/**
 *
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  try {
    const user = newState.member?.user || oldState.member?.user;
    console.log(`oldState:`, oldState, `newState:`, newState)
    console.log(`oldChennels:`, oldState.channelId, `newChennels:`, newState.channelId)
    // console.log(oldState)
    // console.log(newState)
    if (!oldState.channel && newState.channel) {
      console.log(`🎙️ ${user.tag} 加入了語音頻道：${newState.channel.name}`);
    }
    if (oldState.channel && !newState.channel) {
      console.log(`${user.tag} 離開了語音頻道：${oldState.channel.name}`);
    }
    if (
      oldState.channel &&
      newState.channel &&
      oldState.channel.id !== newState.channel.id
    ) {
      console.log(
        `🔄 ${user.tag} 從 ${oldState.channel.name} 移動到 ${newState.channel.name}`
      );
    }
    return;
  } catch (error) {
    console.log(
      `🚨 [voiceStateUpdate] There was an error running this command: ${error}`
    );
  }
};
