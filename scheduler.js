import cron from 'node-cron';
import { DiscordRequest } from './utils.js';
import { getTracker, isTodayCompleted } from './tracker.js';

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
let reminderSentToday = false;

// Reset reminder flag at midnight Eastern Time
cron.schedule('0 0 * * *', () => {
  reminderSentToday = false;
  console.log('🕐 Midnight Eastern Time - reset reminder flag');
}, {
  timezone: 'America/New_York'
});

// Send 5 PM reminder (Eastern Time)
// testing set reminder to true at 23:21
cron.schedule('0 17 * * *', async () => {
  await sendReminder('5 PM');
}, {
  timezone: 'America/New_York'
});

// Send 10 PM follow-up reminder (only if not completed) - Eastern Time
cron.schedule('0 22 * * *', async () => {
  const tracker = getTracker();
  
  if (tracker.isPaused) {
    console.log('⏸️ Reminders are paused, skipping 10 PM reminder');
    return;
  }

  if (isTodayCompleted()) {
    console.log('✅ Already completed today, skipping 10 PM reminder');
    return;
  }

  if (reminderSentToday) {
    console.log('🔔 Sending 10 PM follow-up reminder');
    await sendReminder('10 PM Follow-up');
  }
}, {
  timezone: 'America/New_York'
});

async function sendReminder(timeLabel) {
  const tracker = getTracker();
  
  if (tracker.isPaused) {
    console.log(`⏸️ Reminders are paused, skipping ${timeLabel} reminder`);
    return;
  }

  const reminderDate = new Date().toISOString().split('T')[0]; // Get date when reminder is SENT

  if (isTodayCompleted()) {
    console.log(`✅ Already completed today, skipping ${timeLabel} reminder`);
    return;
  }

  try {
    const endpoint = `channels/${CHANNEL_ID}/messages`;
    
    const message = {
      content: `@everyone 🧹 **Daily Cleaning Reminder** (${timeLabel})\n\nTime for your 30-minute cleanup! Click the button below when you're done.`,
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: 3, // Success/Green style
              label: '✅ Done!',
              custom_id: `cleaning_done_${reminderDate}`,
            },
          ],
        },
      ],
    };

    await DiscordRequest(endpoint, { method: 'POST', body: message });
    reminderSentToday = true;
    console.log(`✅ ${timeLabel} reminder sent successfully`);
  } catch (error) {
    console.error(`❌ Error sending ${timeLabel} reminder:`, error);
  }
}

export function startScheduler() {
  console.log('⏰ Scheduler started!');
  console.log('   - 5 PM reminder scheduled');
  console.log('   - 10 PM follow-up reminder scheduled');
  console.log('   - Midnight reset scheduled');
}