// Command definitions for the Discord cleaning tracker bot

// Command definitions
export const STATS_COMMAND = {
  name: 'stats',
  description: 'Check current cleaning streak and progress',
  type: 1,
};

export const MARK_DONE_COMMAND = {
  name: 'mark-done',
  description: 'Manually mark cleaning as done for a specific date',
  type: 1,
  options: [
    {
      type: 3, // STRING type
      name: 'date',
      description: 'Date to mark as done (YYYY-MM-DD format, defaults to today)',
      required: false,
    },
  ],
};

export const RESET_COMMAND = {
  name: 'reset',
  description: 'Start a fresh 30-day cycle (resets all progress)',
  type: 1,
};

export const PAUSE_COMMAND = {
  name: 'pause',
  description: 'Pause daily reminders temporarily',
  type: 1,
};

export const RESUME_COMMAND = {
  name: 'resume',
  description: 'Resume daily reminders',
  type: 1,
};

export const CANCEL_COMMAND = {
  name: 'cancel',
  description: 'Cancel the current cycle and reset all data',
  type: 1,
};

export const ALL_COMMANDS = [
  STATS_COMMAND,
  MARK_DONE_COMMAND,
  RESET_COMMAND,
  PAUSE_COMMAND,
  RESUME_COMMAND,
  CANCEL_COMMAND,
];