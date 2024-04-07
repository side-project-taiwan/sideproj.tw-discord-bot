const { REST, Routes } = require("discord.js");
const { env } = require("./env");

// 指令
const commands = [
  {
    name: "hey",
    description: "Replies with hey!",
  },
  {
    name: "ping",
    description: "Pong!",
  },
];

const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🚥 Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        env.DISCORD_CLIENT_BOT_ID,
        env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log("🎫 Successfully reloaded application (/) commands.");
  } catch (error) {
    console.log(`🚨 There was an error ${error}`);
  }
})();
