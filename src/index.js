const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const { env } = require("./env");
const eventHandler = require("./handlers/eventHandler");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

(async () => {
  // Connect to MongoDB
  try {
    mongoose.set("strictQuery", false);
    const result = await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(err);
  }
  // DC Client events handler
  eventHandler(client);
  client.login(env.DISCORD_TOKEN);
})();
