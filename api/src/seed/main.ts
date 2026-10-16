import { loadConfig } from '../config';
import { createDb } from '../persistence/db';
import { runSeed } from './run-seed';

// Plain script, not inside Nest: `node dist/seed/main.js [--if-empty]`.
const db = createDb(loadConfig(process.env).databasePath);
try {
  process.exitCode = runSeed(db, process.argv.slice(2), (line) => console.log(line));
} finally {
  db.$client.close();
}
