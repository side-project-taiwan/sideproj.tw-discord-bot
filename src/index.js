const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
const { env } = require("./env");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let botActivityStatus = [
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
]

client.on("ready", (c) => {
  console.log(`🚥 The ${c.user.tag} is online!`);

  //set bot activity status
  client.user.setActivity(botActivityStatus[4])
  setInterval(() => {
    const random = Math.floor(Math.random() * botActivityStatus.length);
    console.log(random);
    client.user.setActivity(botActivityStatus[random])
  }, 1000 * 60 * 60);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  console.log(
    `Message from ${message.channel.name}, ${message.author.displayName}:${message.content}`
  );
  const { content } = message;
  if (content === "hello") {
    message.reply("hello");
  }
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

client.on("interactionCreate", async (interaction) => {
  console.log(
    `Interaction from ${interaction.channel.name}, ${interaction.user.displayName}:${interaction.customId}`
  );
  // buttons 控制
  try {
    if (interaction.isButton()) {
      //step 取得 dc guild role
      const role = interaction.guild.roles.cache.get(interaction.customId);
      // await interaction.deferReply();
      if (!role) {
        interaction.editReply({
          content: "I couldn't find that role",
          // ephemeral: true, // 只有該使用者可以看到
        });
        return;
      }
      //step 檢查該使用者是否有 role
      const hasRole = interaction.member.roles.cache.has(role.id);
      if (hasRole) {
        await interaction.member.roles.remove(role);
        await interaction.reply({
          content:`The role ${role.name} has been removed`,
          ephemeral: true, // 只有該使用者可以看到
        });
        return;
      } else {
        await interaction.member.roles.add(role);
        await interaction.reply({
          content: `The role ${role.name} has been added`,
          ephemeral: true, // 只有該使用者可以看到
        });
        return;
      }
    }
  } catch (error) {
    console.log(`🚨 There was a buttons 控制 error ${error}`);
  }
  // slash commands
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
    // interaction.channel.send({embeds: [embed]});
    interaction.reply({
      embeds: [embed],
    });
  }
});

client.login(env.DISCORD_TOKEN);
