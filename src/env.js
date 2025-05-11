require("dotenv").config();
const { z } = require("zod");

const environmentSchema = z.object({
  DISCORD_CLIENT_BOT_ID: z.string(),
  DISCORD_TOKEN: z.string(),
  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_GUILD_ID: z.string(),
  MONGO_URI: z.string(),
  PORT: z.preprocess((val) => {
    const parsed = parseInt(val, 10);
    return !isNaN(parsed) ? parsed : 3000; // 使用默認值3000如果轉換失敗
  }, z.number()),

  // GOOGLE
  GOOGLE_CALENDAR_ID: z.string(),
});

const {
  DISCORD_CLIENT_BOT_ID,
  DISCORD_TOKEN,
  DISCORD_PUBLIC_KEY,
  DISCORD_GUILD_ID,
  MONGO_URI,
  PORT,
  GOOGLE_CALENDAR_ID,
} = process.env;

const environment = environmentSchema.safeParse({
  DISCORD_CLIENT_BOT_ID,
  DISCORD_TOKEN,
  DISCORD_PUBLIC_KEY,
  DISCORD_GUILD_ID,
  MONGO_URI,
  PORT,
  GOOGLE_CALENDAR_ID,
});

if (!environment.success) {
  console.log("Environment validation failed: ");
  console.error(environment.error.errors);
  process.exit(1);
}

exports.env = environment.data;
