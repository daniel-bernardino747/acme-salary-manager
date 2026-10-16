import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

const MISSING_DATABASE_PATH = 'DATABASE_PATH must be set to the SQLite file path (or :memory:).';

describe('loadConfig', () => {
  it.each([{}, { DATABASE_PATH: '' }])(
    'throws when DATABASE_PATH is missing or empty: %o',
    (env) => {
      expect(() => loadConfig(env)).toThrow(MISSING_DATABASE_PATH);
    },
  );

  it('accepts :memory: as the database path', () => {
    expect(loadConfig({ DATABASE_PATH: ':memory:' }).databasePath).toBe(':memory:');
  });

  it('defaults the port to 3000', () => {
    expect(loadConfig({ DATABASE_PATH: 'acme.db' })).toEqual({
      port: 3000,
      databasePath: 'acme.db',
    });
  });

  it('reads the port', () => {
    expect(loadConfig({ DATABASE_PATH: 'acme.db', PORT: '8080' }).port).toBe(8080);
  });

  it.each(['abc', '0', '-1', '3.5'])('throws for PORT=%s', (port) => {
    expect(() => loadConfig({ DATABASE_PATH: 'acme.db', PORT: port })).toThrow(
      `PORT must be a positive integer, got "${port}".`,
    );
  });
});
