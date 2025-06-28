require("dotenv").config();
const { z } = require("zod");
console.log("當前環境設定：", process.env.NODE_ENV);

const environmentSchema = z.object({
  //Port(伺服器設定相關)
  PORT: z.preprocess((val) => {
    const parsed = parseInt(val, 10);
    return !isNaN(parsed) ? parsed : 3000; // 使用默認值3000如果轉換失敗
  }, z.number()),
  ENV: z.enum(["production", "staging", "dev"]),

  //Discord Bot ID(機器人設定相關)
  DISCORD_CLIENT_BOT_ID: z.string(),
  DISCORD_TOKEN: z.string(),
  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_GUILD_ID: z.string(),
  //Discord Roles(角色設定相關)
  roles: z.object({
    eventHost: z.string(),
  }),
  //Discord Channels(頻道設定相關)
  channels: z.object({
    eventStage: z.string(),
    eventStageCompletedCount: z.string(),
    adventureLog: z.string(),
    memberCount: z.string(),
    sp: z.string(),
  }),

  //MongoDB(資料庫設定相關)
  MONGO_URI: z.string(),

  // GOOGLE(Google Calendar設定相關)
  GOOGLE_CALENDAR_ID: z.string(),
});

const {
  PORT,
  NODE_ENV,
  DISCORD_CLIENT_BOT_ID,
  DISCORD_TOKEN,
  DISCORD_PUBLIC_KEY,
  DISCORD_GUILD_ID,
  DISCORD_ROLE_EVENT_HOST_ID,
  DISCORD_CHANNEL_EVENT_STAGE_ID,
  DISCORD_CHANNEL_EVENT_STAGE_COMPLETED_COUNT_ID,
  DISCORD_CHANNEL_ADVENTURE_LOG_ID,
  DISCORD_CHANNEL_MEMBER_COUNT_ID,
  DISCORD_CHANNEL_SP_ID,
  MONGO_URI,
  GOOGLE_CALENDAR_ID,
} = process.env;

const environment = environmentSchema.safeParse({
  PORT,
  ENV: NODE_ENV,
  DISCORD_CLIENT_BOT_ID,
  DISCORD_TOKEN,
  DISCORD_PUBLIC_KEY,
  DISCORD_GUILD_ID,
  roles: {
    eventHost: DISCORD_ROLE_EVENT_HOST_ID,
  },
  channels: {
    eventStage: DISCORD_CHANNEL_EVENT_STAGE_ID,
    eventStageCompletedCount: DISCORD_CHANNEL_EVENT_STAGE_COMPLETED_COUNT_ID,
    adventureLog: DISCORD_CHANNEL_ADVENTURE_LOG_ID,
    memberCount: DISCORD_CHANNEL_MEMBER_COUNT_ID,
    sp: DISCORD_CHANNEL_SP_ID,
  },
  MONGO_URI,
  GOOGLE_CALENDAR_ID,
});

if (!environment.success) {
  console.log("Environment validation failed: ");
  console.error(environment.error.errors);
  process.exit(1);
}

exports.env = environment.data;
