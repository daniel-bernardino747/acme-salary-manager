import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';
import { employeeListResponseSchema } from '@acme/contract';
import { FIRST_PAGE, perfRequests, type PerfRequest } from './requests';
import { renderResults, type EndpointResult, type RunInfo } from './results';
import { serverDuration } from './server-duration';
import { meetsTarget, summarizeTimings } from './timing-summary';

// A plain script, never run in CI (ADR 0006, *Measuring the 500 ms target*):
// `pnpm perf <baseUrl> --region <region> --seed-mode <mode> --client <where this runs from>`.

const WARM_UPS = 3;
const TIMED = 100;

/** The repo's `docs/`, from `api/dist/perf/`. */
const resultsPath = path.join(__dirname, '..', '..', '..', 'docs', 'performance-results.md');

const usage =
  'Usage: pnpm perf <baseUrl> --region <Railway region> --seed-mode <seed mode> --client <where this runs from>';

interface Timing {
  server: number;
  client: number;
  body: string;
}

/** One sequential `GET`. Client time runs until the whole body is read; anything but 200 stops the run. */
async function timeOnce(url: URL): Promise<Timing> {
  const start = performance.now();
  const res = await fetch(url);
  const body = await res.text();
  const client = performance.now() - start;
  if (res.status !== 200) {
    throw new Error(`GET ${url.href} answered ${res.status}: ${body.slice(0, 300)}`);
  }
  return { server: serverDuration(res.headers.get('server-timing')), client, body };
}

/** The endpoint's first request of the run, then the warm-ups, then the timed requests, in sequence. */
async function measure(
  baseUrl: string,
  request: PerfRequest,
): Promise<{ result: EndpointResult; coldBody: string }> {
  const url = new URL(request.path, baseUrl);
  const cold = await timeOnce(url);
  for (let i = 0; i < WARM_UPS; i++) {
    await timeOnce(url);
  }
  const timed: Timing[] = [];
  for (let i = 0; i < TIMED; i++) {
    timed.push(await timeOnce(url));
  }
  const result = {
    request,
    server: summarizeTimings({ cold: cold.server, timed: timed.map((t) => t.server) }),
    client: summarizeTimings({ cold: cold.client, timed: timed.map((t) => t.client) }),
  };
  console.log(
    `${request.label}: server p95 ${result.server.p95.toFixed(2)} ms, client p95 ${result.client.p95.toFixed(2)} ms`,
  );
  return { result, coldBody: cold.body };
}

/** The checkout's commit, marked when it has uncommitted changes. */
function commit(): string {
  const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const sha = git('rev-parse', '--short', 'HEAD');
  return git('status', '--porcelain') === '' ? sha : `${sha} (with uncommitted changes)`;
}

function readArgs(): Omit<RunInfo, 'date' | 'commit' | 'rowCount' | 'warmUps' | 'timed'> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      region: { type: 'string' },
      'seed-mode': { type: 'string' },
      client: { type: 'string' },
    },
  });
  const [baseUrl] = positionals;
  const { region, 'seed-mode': seedMode, client } = values;
  if (positionals.length !== 1 || !baseUrl || !URL.canParse(baseUrl)) {
    throw new Error(`Expected one base URL. ${usage}`);
  }
  if (!region || !seedMode || !client) {
    throw new Error(`The script cannot find these out, so each must be given. ${usage}`);
  }
  return { baseUrl, region, seedMode, clientLocation: client };
}

async function main(): Promise<void> {
  const args = readArgs();
  const date = new Date().toISOString();
  const first = await measure(args.baseUrl, FIRST_PAGE);
  const rowCount = employeeListResponseSchema.parse(JSON.parse(first.coldBody)).total;
  const results = [first.result];
  for (const request of perfRequests(rowCount).slice(1)) {
    results.push((await measure(args.baseUrl, request)).result);
  }
  const run: RunInfo = {
    ...args,
    date,
    commit: commit(),
    rowCount,
    warmUps: WARM_UPS,
    timed: TIMED,
  };
  writeFileSync(resultsPath, renderResults(run, results));
  const passed = results.every((result) => meetsTarget(result.server));
  console.log(`${passed ? 'Pass' : 'Fail'}. Results written to ${resultsPath}`);
  process.exitCode = passed ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
