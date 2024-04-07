const {
  Client,
  IntentsBitField,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
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
  console.log(
    `Message from ${message.channel.name}, ${message.author.displayName}:${message.content}`
  );

  if (message.content === "hello") {
    message.reply("hello");
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log("⌘: ", interaction.commandName);
  const { commandName } = interaction;

  // slash commands
  if (commandName === "hey") {
    interaction.reply("hey!");
  }
  if (commandName === "ping") {
    interaction.reply("Pong!");
  }

  // options
  if (commandName === "add") {
    const num1 = interaction.options.getNumber("first_number");
    const num2 = interaction.options.getNumber("second_number");
    console.log(num1, num2);
    interaction.reply(`The sum is ${num1 + num2}`);
  }

  // embed
  if (commandName === "embed") {
    const embed = new EmbedBuilder()
      .setTitle("This is an embed")
      .setDescription("This is a test embed")
      .setColor("Random")
      .addFields(
        { name: "Field title", value: "Some valse", inline: true },
        { name: "Field title", value: "Some valse", inline: true }
      );
    console.log(embed.toJSON());
    interaction.reply({
      embeds: [embed],
    });
  }
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  console.log(
    `Message from ${message.channel.name}, ${message.author.displayName}:${message.content}`
  );
  const { content } = message;
  // embed
  if (content === "embed") {
    const embed = new EmbedBuilder()
      .setTitle("This is an embed")
      .setDescription("This is a test embed")
      .setColor("Random")
      .addFields(
        { name: "Field title", value: "Some valse", inline: true },
        { name: "Field title", value: "Some valse", inline: true }
      );
    console.log(embed.toJSON());
    //# Will @user and reply to the message
    // message.reply({
    //   embeds: [embed],
    // });
    
    //# Will only send the embed
    message.channel.send({
      embeds: [embed],
    });
  }
});

client.login(env.DISCORD_TOKEN);
