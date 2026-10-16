export interface Config {
  port: number;
  databasePath: string;
}

/** Reads the app's only configuration, from environment variables. */
export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const databasePath = env.DATABASE_PATH;
  if (!databasePath) {
    throw new Error('DATABASE_PATH must be set to the SQLite file path (or :memory:).');
  }
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT must be a positive integer, got "${env.PORT}".`);
  }
  return { port, databasePath };
}
