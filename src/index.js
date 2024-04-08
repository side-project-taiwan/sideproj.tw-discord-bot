const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
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

// DC Client events handler
eventHandler(client);

client.login(env.DISCORD_TOKEN);