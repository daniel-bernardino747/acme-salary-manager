import { loadConfig } from './config';
import { createDb } from './persistence/db';

// `node dist/migrate.js`: createDb applies every pending migration.
createDb(loadConfig(process.env).databasePath).$client.close();
console.log('Migrations applied.');
