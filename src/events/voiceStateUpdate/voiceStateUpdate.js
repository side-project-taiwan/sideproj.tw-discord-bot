const { Client, VoiceState } = require("discord.js");
const {findActiveEvents} = require("../../services/activityTracker.service");
/**
 *
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  try {
    const events = await findActiveEvents(oldState.guild.id);
    if (events.length === 0) {
      return;
    }
    const activeEvent = events[0];
    const activeEventChannel = activeEvent.channelId;
    if (activeEventChannel !== newState.channelId && activeEventChannel !== oldState.channelId) {
      return;
    }
    const user = newState.member?.user || oldState.member?.user;
    // console.log(`oldState:`, oldState, `newState:`, newState)
    // console.log(`oldChennels:`, oldState.channelId, `newChennels:`, newState.channelId)
    // console.log(oldState)
    // console.log(newState)
    if (newState.channelId === activeEventChannel) {
      console.log(`🎙️ ${user.tag} 加入了語音頻道：${newState.channel.name}`);
      const userLog = activeEvent.participants.get(user.id);
      if(userLog){
        userLog.push({
          join: new Date(),
          leave: null,
        });
      } else {
        activeEvent.participants.set(user.id, [
          {
            join: now,
            leave: null,
          },
        ]);
      }
      activeEvent.markModified('participants');
      await activeEvent.save();
      return;
    }
    if (oldState.channelId === activeEventChannel) {
      console.log(`${user.tag} 離開了語音頻道：${oldState.channel.name}`);
      const userLog = activeEvent.participants.get(user.id);
      if(userLog && userLog.length > 0){
        userLog[userLog.length - 1].leave = new Date();
        activeEvent.markModified('participants');
      }
      await activeEvent.save();
      return;
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
    console.log('待處理')
    return;
  } catch (error) {
    console.log(
      `🚨 [voiceStateUpdate] There was an error running this command: ${error}`
    );
  }
};
