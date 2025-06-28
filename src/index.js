const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const { env } = require("./env");
const eventHandler = require("./handlers/eventHandler");
const { featureToggle } = require("../config.json");
const { ensureFeatureToggles } = require("./services/featureToggle.service");
const loadAllJobs = require("./jobs/loadAllJobs");
const { setClient, startAllCronJobs } = require("./services/time.service");

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

(async () => {
  // Connect to MongoDB
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");
    await ensureFeatureToggles(Object.values(featureToggle));
  } catch (error) {
    console.log(error);
  }

  // load and start cron jobs
  setClient(client);
  loadAllJobs();
  startAllCronJobs();

  eventHandler(client);
  client.login(env.DISCORD_TOKEN);
})();
