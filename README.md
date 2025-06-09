# sideproj.tw-discord-bot

A Discord bot for Side Project Taiwan.
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
DISCORD_GUILD_ID
MONGO_UR
GOOGLE_CALENDAR_ID
```


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