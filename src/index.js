const { Client, IntentsBitField, GatewayIntentBits } = require("discord.js");
const { env } = require("./env");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});


client.on("ready", (c) => {
  console.log(`🚥 The ${c.user.tag} is online!`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  console.log(`Message from ${message.channel.name}, ${message.author.displayName}:${message.content}`);

  if (message.content === "hello") {
    message.reply("hello");
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
console.log("⌘: ",interaction.commandName);
  const { commandName } = interaction;

  if (commandName === "hey") {
    interaction.reply("hey!");
  }
  if (commandName === "ping") {
    interaction.reply("Pong!");
  }
});

client.login(env.DISCORD_TOKEN);
