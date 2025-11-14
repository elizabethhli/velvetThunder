import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getTracker, markComplete, getStats, resetCycle, pauseReminders, resumeReminders, cancelCycle } from './tracker.js';
import { startScheduler } from './scheduler.js';

// Create an express app
const app = express();
const PORT = process.env.PORT || 3000;

// Start the daily reminder scheduler
startScheduler();

// Add error handling middleware for signature verification
app.use((err, req, res, next) => {
  if (err) {
    console.error('❌ Signature verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid signature' });
  }
  next();
});

// Parse request body and verify incoming requests using discord-interactions package
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    console.log('✅ Received interaction:', req.body.type, req.body.data?.name || 'N/A');
    const { type, data, member, user } = req.body;

    // Handle slash command interactions
    if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // /stats command - show current progress
    if (name === 'stats') {
        const stats = getStats();
        const progressBar = createProgressBar(stats.totalCompleted, 30);
        
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [{
                title: '🧹 Cleaning Tracker Stats',
                color: 0x5865F2,
                fields: [
                    {
                        name: '🔥 Current Streak',
                        value: `${stats.currentStreak} days`,
                        inline: true
                    },
                    {
                        name: '📊 Progress to Reward',
                        value: `${stats.totalCompleted}/30 days`,
                        inline: true
                    },
                    {
                        name: '📅 Cycle Started',
                        value: stats.cycleStartDate || 'Not started',
                        inline: true
                    },
                    {
                        name: 'Progress Bar',
                        value: progressBar,
                        inline: false
                    },
                    {
                        name: 'Status',
                        value: stats.isPaused ? '⏸️ Paused' : '✅ Active',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
                }]
            },
        });
    }

    // /mark-done command - manually mark a day complete
    if (name === 'mark-done') {
        const dateOption = data.options?.find(opt => opt.name === 'date');
        const dateStr = dateOption?.value || new Date().toLocaleDateString('sv-SE', { timeZone: 'America/New_York' });
        
        const result = markComplete(dateStr, member?.user?.username || user?.username || 'Someone');
        
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: result.message,
                embeds: result.milestone ? [{
                    title: result.milestone.title,
                    description: result.milestone.message,
                    color: 0x57F287,
                    image: { url: result.milestone.gif }
                }] : undefined
            },
        });
    }

    // /reset command - start fresh 30-day cycle
    if (name === 'reset') {
        resetCycle();
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: '🔄 Cycle reset! Starting fresh with a new 30-day goal. Good luck! 🎯',
            },
        });
    }

    // /pause command - pause daily reminders
    if (name === 'pause') {
        pauseReminders();
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: '⏸️ Daily reminders paused. Use `/resume` when you\'re ready to continue!',
            },
        });
    }

    // /resume command - resume daily reminders
    if (name === 'resume') {
        resumeReminders();
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: '▶️ Daily reminders resumed! Let\'s keep that streak going! 🔥',
            },
        });
    }

    // /cancel command - end current cycle
    if (name === 'cancel') {
        cancelCycle();
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: '❌ Current cycle cancelled. All progress has been reset. Use `/reset` to start a new cycle when ready.',
            },
        });
    }
    }

    // Handle button interactions
    if (type === InteractionType.MESSAGE_COMPONENT) {
        const { custom_id } = data;

        if (custom_id.startsWith('cleaning_done')) {
            // Get date from custom_id
            const dateFromButton = custom_id.replace('cleaning_done', '');
            const username = member?.user?.username || user?.username || 'Someone';
            const result = markComplete(dateFromButton, username);

            // Update the original message to show it's been completed
            return res.send({
                type: InteractionResponseType.UPDATE_MESSAGE,
                data: {
                    content: `✅ ${result.message}`,
                    components: [], // Remove the button
                    embeds: result.milestone ? [{
                        title: result.milestone.title,
                        description: result.milestone.message,
                        color: 0x57F287,
                        image: { url: result.milestone.gif }
                    }] : undefined
                },
            });
        }
    }

    // Handle ping from Discord
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    console.error('Unknown interaction type', type);
    return res.status(400).json({ error: 'Unknown interaction type' });
});

// Simple health check endpoint
app.get('/', (req, res) => {
    const stats = getStats();
    res.json({
        status: 'healthy',
        message: '🧹 Cleaning Tracker Bot is running!',
        uptime: process.uptime(),
        streak: stats.currentStreak,
        isPaused: stats.isPaused
    });
});

// Handle incorrect POST requests to root
app.post('/', (req, res) => {
    console.log('⚠️ Received POST to root - Discord webhook may be misconfigured');
    res.status(404).json({ 
        error: 'Endpoint not found. Use /interactions for Discord webhooks.' 
    });
});

app.listen(PORT, () => {
    console.log('🧹 Cleaning Tracker Bot is listening on port', PORT);
});

// Helper function to create progress bar
function createProgressBar(current, total) {
    const percentage = Math.min(current / total, 1);
    const filled = Math.round(percentage * 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${total} days`;
}