# sideproj.tw-discord-bot

A [Discord bot](https://discord.com/developers/docs/intro) for [Side Project Taiwan](https://discord.gg/uERn8yW2xh).
This Readme is a WIP.

## Requirements

Install [Node.js](https://nodejs.org/zh-tw)

## Check Versions & Start

```
$ node -v
v22.16.0

$ npm -v
10.9.2

// To start the bot
$ npm start
```

## .env Configuration

```env
DISCORD_CLIENT_BOT_ID
DISCORD_TOKEN
DISCORD_PUBLIC_KEY
DISCORD_ROLE_EVENT_HOST_ID                      # Role ID for Event Hosts
DISCORD_CHANNEL_EVENT_STAGE_ID                  # Channel ID for the Event Stage
DISCORD_CHANNEL_EVENT_STAGE_COMPLETED_COUNT_ID  # Channel ID showing stage attendee count
DISCORD_CHANNEL_ADVENTURE_LOG_ID                # Channel ID for the Adventure Log
DISCORD_CHANNEL_MEMBER_COUNT_ID                 # Channel ID showing total server member count
MONGO_UR
GOOGLE_CALENDAR_ID                              # ID of the Calendar to auto-schedule events
```

## Available Commands

- **/每日簽到**  
  Sign in daily to earn activity mileage. Redeem rewards in the future!

- **/打卡**  
  Clock in to work on your side project and earn mileage points.

- **/冒險卡**  
  View your personal adventure profile.

- **/level [Discord User ID]**  
  Check your own or another user's level card.

- **/sp-ranking**  
  View your level ranking and current activity status.


## Project Structure

```tree
src/
├─commands/
│  ├─activity/
│  ├─economy/
│  ├─misc/
│  ├─moderation/
│  └─users/
├─enums/
├─events/
│  ├─guildMemberAdd/
│  ├─guildMemberRemove/
│  ├─guildScheduledEventCreate/
│  ├─guildScheduledEventDelete/
│  ├─guildScheduledEventUpdate/
│  ├─interactionCreate/
│  │  ├─button/
│  │  ├─channelSelectMenu/
│  │  └─modalSubmit/
│  ├─messageCreate/
│  ├─ready/
│  └─voiceStateUpdate/
├─handlers/
├─models/
├─seeds/
├─services/
└─utils/
```

## Tutorial

[YouTube Playlist](https://www.youtube.com/watch?v=B7_77HK0fnY&list=PLpmb-7WxPhe0ZVpH9pxT5MtC4heqej8Es&index=9)

## Future Goal

We are currently planning the following features:

- **Mileage Store**: Redeem your activity mileage for exclusive rewards and items.
- **Pet System**: Raise your own virtual pets as part of your adventure journey.