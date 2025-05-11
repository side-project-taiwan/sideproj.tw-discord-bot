const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const { env } = require("./env");
const eventHandler = require("./handlers/eventHandler");
const { featureToggle } = require("../config.json");
const { ensureFeatureToggles } = require("./services/featureToggle.service");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.MessageContent,
  ],
});

(async () => {
  // Connect to MongoDB
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");
    await ensureFeatureToggles(Object.values(featureToggle));
  } catch (error) {
    console.log(err);
  }
  // DC Client events handler
  eventHandler(client);
  client.login(env.DISCORD_TOKEN);
})();
