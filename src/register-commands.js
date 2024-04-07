const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");
const { env } = require("./env");

// 指令
const commands = [
  // slash commands
  {
    name: "hey",
    description: "Replies with hey!",
  },
  {
    name: "ping",
    description: "Pong!",
  },
  // options
  {
    name: "add",
    description: "Add two numbers",
    options: [
      {
        name: "first_number",
        description: "The first number",
        type: ApplicationCommandOptionType.Number,
        choices: [
          {
            name: "One",
            value: 1,
          },
          {
            name: "Two",
            value: 2,
          },
          {
            name: "Three",
            value: 3,
          },
        ],
        required: true,
      },
      {
        name: "second_number",
        description: "The second number",
        type: ApplicationCommandOptionType.Number,
        choices: [
          {
            name: "One",
            value: 1,
          },
          {
            name: "Two",
            value: 2,
          },
          {
            name: "Three",
            value: 3,
          },
        ],
        required: true,
      },
    ],
  },
  // embed
  {
    name: "embed",
    description: "Sends an embed",
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
