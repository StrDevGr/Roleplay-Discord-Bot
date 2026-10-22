# Roleplay Discord Bot

A Discord bot built with **Node.js**, **discord.js**, and **SQLite** for managing a roleplay community.

## Features

- **Ticket system** — support, donations, staff reports, ban appeals, bug reports, crash reports, lost items, and other tickets.
- **Ticket transcripts** — generates HTML transcripts and records ticket activity.
- **Staff applications** — application panels, forms, review buttons, and accept/reject notifications.
- **Criminal team applications** — application flows for mafias, cartels, and gangs.
- **Moderation and logging** — member joins/leaves, bans, messages, voice activity, channels, roles, and other server events.
- **Security tools** — configurable anti-link and anti-spam protections, security logs, and whitelist settings.
- **Temporary voice channels** — join-to-create voice channels with configured roles and logging.
- **Duty tracking** — tracks on-duty time using SQLite.
- **Auto-role** — assigns a configured role to new members.
- **Invite tracking** — invite statistics, leaderboard, and administrative invite management.
- **Giveaway support** — giveaway entry interactions and related logging.
- **Components V2 interface** — interactive Discord panels and buttons.

## Tech Stack

- JavaScript
- Node.js
- discord.js
- better-sqlite3
- HTML/CSS for ticket transcripts
- JSON configuration files

## Requirements

- Node.js
- A Discord application and bot token
- The required Discord bot permissions and intents
- Dependencies installed with npm

## Setup

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project directory:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   ```

4. Make sure the code reads the token from `process.env.DISCORD_TOKEN` and **does not contain a hard-coded token**.
5. Configure the server, role, and channel IDs for your own Discord server.
6. Enable the required privileged intents in the Discord Developer Portal.
7. Start the bot:

   ```bash
   node index.js
   ```

## Main Prefix Commands

| Command | Description |
|---|---|
| `!ticket_menu` | Publishes the ticket selection panel (administrator only). |
| `!applications` | Publishes the staff application panel (administrator only). |
| `!crimapps` | Publishes the criminal team application panel. |
| `!logs-setup` | Creates/configures server log channels (administrator only). |
| `!securitylogssetup` | Sets up security logging. |
| `!security` | Manages security protection settings. |
| `!secsettings` | Displays security settings. |
| `!secwl` | Manages security whitelist entries. |
| `!setupduty` | Sets up the duty panel. |
| `!invites [@user]` | Displays invite statistics for a user or yourself. |
| `!lb` | Displays the invite leaderboard. |
| `!resetinvites @user` | Resets a user's invite count (administrator only). |
| `!addInvites @user <amount>` | Adds invites to a user (administrator only). |
| `!commands` | Displays the commands panel. |

Some features may require additional configuration before they work in another server.

## Configuration and Data

- `index.js` — bot logic and event handlers.
- `.env` — private bot token; do not commit this file.
- `log_channels.json` — log channel configuration created/used by the bot.
- `duty.db` — SQLite database for duty tracking.
- Other SQLite/JSON data files may be created by enabled modules.

## Security

**Never publish your Discord bot token.** Keep it in `.env`, add `.env` and database files to `.gitignore`, and use environment variables for secrets. If a token has already been uploaded or shared, reset it immediately in the Discord Developer Portal.

## Disclaimer

This project is provided as a community bot template. Review permissions, configuration IDs, and security settings before running it in a production server.
