const { Client, ActivityType } = require("discord.js");

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  console.log("🍗 Start botActivity.js");
  client.user.setActivity(botActivityStatus[4]);
  setInterval(() => {
    const random = Math.floor(Math.random() * botActivityStatus.length);
    client.user.setActivity(botActivityStatus[random]);
  }, 1000 * 60 * 60);
};

const botActivityStatus = [
  {
    name: "SPT Bot - Competing",
    type: ActivityType.Competing,
  },
  {
    name: "SPT Bot - Custom",
    type: ActivityType.Custom,
  },
  {
    name: "SPT Bot - Listening",
    type: ActivityType.Listening,
  },
  {
    name: "SPT Bot - Playing",
    type: ActivityType.Playing,
  },
  {
    name: "SPT Bot - Streaming",
    type: ActivityType.Streaming,
    url: "https://www.twitch.tv/jooooisme", // url: only twitch url or youtube url
  },
  {
    name: "SPT Bot - Watching",
    type: ActivityType.Watching,
    url: "https://www.twitch.tv/jooooisme", // url: only twitch url or youtube url
  },
];
