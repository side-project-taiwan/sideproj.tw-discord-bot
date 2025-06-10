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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const serverEnv = require("./utils/serverEnv");
const currentEnv = serverEnv.getEnv(env.DISCORD_GUILD_ID); // 👈 SERVER_ID 由 .env 提供

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
  eventHandler(client, currentEnv);
  client.login(env.DISCORD_TOKEN);
})();
