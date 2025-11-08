import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import { ALL_COMMANDS } from './commands.js';

// Install commands
InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

console.log('✅ Commands registered successfully!');
console.log('Registered commands:', ALL_COMMANDS.map(c => c.name).join(', '));