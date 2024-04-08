const {
  Client,
  IntentsBitField,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

const roles = [
  {
    id: "1226787842873888870", // Red ID
    label: "Red",
  },
  {
    id: "1226788050051530782", // Blue ID
    label: "Blue",
  },
  {
    id: "1226787985979211776", // Green ID
    label: "Green",
  },
];

const 練舞室 = "1221107745051250840";
const 會議室A = "1210620729268244540";
const discordBotDev = "1226470842133774336";

client.on("ready", async(c) => {
  console.log(`🚥 The ${c.user.tag} is online!`);
  try {
    const channel = c.channels.cache.get(discordBotDev);
    if (!channel) return console.log("🚨 Channel not found");

    const row = new ActionRowBuilder();

    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary)
      );
    });

    await channel.send({
      content: "Claim or remove a role below.",
      components: [row],
    });
    process.exit(0);
  } catch (error) {
    console.log(`🚨 There was an error ${error}`);
    process.exit(1);
  }
});

client.login(env.DISCORD_TOKEN);
