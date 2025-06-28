# sideproj.tw-discord-bot

A [Discord bot](https://discord.com/developers/docs/intro) for [Side Project Taiwan](https://discord.gg/uERn8yW2xh).

This bot helps make our community more active.  
Join events or build side projects to earn SP and level up.  
We’re also adding a check-in system and pet-raising soon. Stay tuned!  

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
# Environment Variables

## SERVER
PORT                                            # Port of the server
NODE_ENV                                        # Environment setting

## DISCORD
DISCORD_CLIENT_BOT_ID                           # Bot client ID
DISCORD_TOKEN                                   # Bot token
DISCORD_PUBLIC_KEY                              # Public key for verifying interactions
DISCORD_GUILD_ID                                # Discord server (guild) ID
DISCORD_ROLE_EVENT_HOST_ID                      # Role ID for Event Hosts
DISCORD_CHANNEL_EVENT_STAGE_ID                  # Channel ID for the Event Stage
DISCORD_CHANNEL_EVENT_STAGE_COMPLETED_COUNT_ID  # Channel ID showing stage attendee count
DISCORD_CHANNEL_ADVENTURE_LOG_ID                # Channel ID for the Adventure Log
DISCORD_CHANNEL_MEMBER_COUNT_ID                 # Channel ID showing total server member count
DISCORD_CHANNEL_SP_ID                           # Side project point ranking
Side project point ranking

## MONGO
MONGO_URI                                       # MongoDB connection URI

## GOOGLE CALENDAR
GOOGLE_CALENDAR_ID                              # Google Calendar ID for scheduling events
```

## Available Commands for Discord Participants

- **/每日簽到**  
  Sign in daily to earn activity mileage. Redeem rewards in the future!

- **/打卡**  
  Clock in to work on your side project and earn mileage points.

- **/冒險卡**  
  View your personal adventure profile.

- **/level [Discord User ID]**  
  Check your own or another user's level card.

- **/sp-ranking [Duration]**  
  View your level ranking and current activity status.


## Available Commands for Discord Hosts

- **/查看活動**
  View upcoming scheduled events.

- **/活動建立**
  Create a new event to track participant time.
  This is used for awarding shards (used for leveling up) and keeping event records.


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
- Automatically record and transcribe voice events.
- Visualize the transcribed content for Side Project Point features.


We warmly welcome everyone to contribute and join the fun!  
We are Side Project Taiwan - a community for builders and dreamers.  
[Join us on Discord](https://discord.gg/uERn8yW2xh)  
[Follow us on Threads](https://www.threads.com/@sideprojecttaiwan?igshid=NTc4MTIwNjQ2YQ==)  
