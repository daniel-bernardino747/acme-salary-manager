import { loadConfig } from '../config';
import { createDb } from './db';

// `node dist/persistence/migrate.js`: createDb applies every pending migration.
createDb(loadConfig(process.env).databasePath).$client.close();
console.log('Migrations applied.');
