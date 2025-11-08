# 🧹 Discord Cleaning Tracker Bot
A Discord bot to help track daily cleaning habits with streak tracking, milestone celebrations, and reward systems!

## Features
✅ Daily Reminders at 5 PM and 10 PM (if not completed)
🔥 Streak Tracking - Track consecutive days completed
📊 Progress Bar - Visual progress toward 30-day goal
🎉 Milestone Celebrations - GIF celebrations at 7, 14, 21, and 30 days
🎮 Interactive Buttons - Click "Done" to mark completion
📱 Slash Commands - Full control with Discord slash commands

## Setup Instructions
1. Create a Discord Application
Go to Discord Developer Portal
Click "New Application" and give it a name
Go to the "Bot" tab and click "Add Bot"
Under "Privileged Gateway Intents", enable:
Message Content Intent
Click "Reset Token" and copy your bot token (save it for later)
2. Get Your Credentials
You'll need these values for your .env file:

APP_ID: From "General Information" tab (Application ID)
PUBLIC_KEY: From "General Information" tab
DISCORD_TOKEN: The bot token you just copied
DISCORD_CHANNEL_ID: Right-click the Discord channel where you want reminders → "Copy Channel ID"
You may need to enable Developer Mode in Discord Settings → Advanced → Developer Mode
3. Install and Run Locally
bash
# Clone or create the project directory
mkdir cleaning-tracker-bot
cd cleaning-tracker-bot

# Copy all the bot files (app.js, commands.js, tracker.js, etc.)

# Install dependencies
npm install

# Create .env file from .env.sample and fill in your credentials
cp .env.sample .env
# Edit .env with your credentials

# Register slash commands with Discord
npm run register

# Start the bot
npm start
4. Set Up Interactions Endpoint (for local development)
For local testing, you'll need ngrok:

bash
# Install ngrok
# Then run:
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Go to your Discord app's "General Information" tab
# Set "Interactions Endpoint URL" to: https://abc123.ngrok.io/interactions
5. Invite Bot to Your Server
Go to "OAuth2" → "URL Generator" in Discord Developer Portal
Select scopes: bot and applications.commands
Select bot permissions:
Send Messages
Use Slash Commands
Copy the generated URL and open it in your browser
Select your server and authorize
Deploying to Render (Free Hosting)
Push your code to GitHub (don't commit .env file!)
Go to Render and sign up
Click "New +" → "Web Service"
Connect your GitHub repository
Configure:
Name: cleaning-tracker-bot
Environment: Node
Build Command: npm install
Start Command: npm start
Add environment variables (APP_ID, DISCORD_TOKEN, PUBLIC_KEY, DISCORD_CHANNEL_ID)
Click "Create Web Service"
Copy your Render URL (e.g., https://cleaning-tracker-bot.onrender.com)
Update Discord "Interactions Endpoint URL" to: https://cleaning-tracker-bot.onrender.com/interactions
Available Commands
/stats - View current streak and progress
/mark-done [date] - Manually mark a day as complete
/reset - Start a fresh 30-day cycle
/pause - Pause daily reminders
/resume - Resume daily reminders
/cancel - Cancel current cycle and reset all data
How It Works
5 PM Daily: Bot sends a reminder with a "✅ Done" button
Click Done: Either partner can click to mark the day complete
10 PM Follow-up: If not completed, bot sends another reminder
Milestones: Celebrate at 7, 14, 21, and 30 days with fun GIFs
Rewards: After 30 days, you've earned your treat together! 🎉
Customization
Change Reminder Times
Edit scheduler.js:

javascript
// Current: 5 PM
cron.schedule('0 17 * * *', async () => {
  await sendReminder('5 PM');
});

// Change to 6 PM:
cron.schedule('0 18 * * *', async () => {
  await sendReminder('6 PM');
});
Cron format: minute hour * * *

0 17 = 5 PM
0 18 = 6 PM
30 20 = 8:30 PM
Change Celebration GIFs
Edit tracker.js and update the CELEBRATION_GIFS object with your preferred GIF URLs.

Troubleshooting
Bot not responding: Check that Interactions Endpoint URL is set correctly
No reminders: Verify DISCORD_CHANNEL_ID is correct and bot has permissions
Commands not showing: Run npm run register again
Bot offline: If using Render free tier, it may sleep after inactivity. Upgrade or use a ping service.
Support
Questions? Check the Discord Developer Docs or join the Discord Developers server.

Good luck with your cleaning journey! 🧹✨

