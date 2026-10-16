# Performance

The requirement is that the employee list and each pay question respond in under 500 ms on the deployed app (user story 65). This note says what is measured and how. The figures are in [`performance-results.md`](performance-results.md), which `pnpm perf` generates and overwrites on each run. No figure appears here: they change with each run, and the results file is the only place they come from. Why it is measured this way is in [ADR 0006](adr/0006-testing-strategy-and-performance-measurement.md#measuring-the-500-ms-target).

## What is measured

**Pass or fail is judged on server time:** the p95 server time must be under 500 ms on every endpoint in the request list. The target is a claim about what the app does, and the client's time depends on where the script runs from, which the app does not control. Client time is reported next to it.

**Server time** is what the app reports in its `Server-Timing: app;dur=<ms>` header, which every `/api` response carries. A middleware registered before any other ([`server-timing.ts`](../api/src/http/server-timing.ts)) reads `performance.now()` when Express hands it the request, and again when the response's headers are written (through `on-headers`). The interval therefore covers:

- routing, guards and pipes, so query validation is in it;
- the handler: the SQL read and the domain computation;
- the Problem Details filter, on an error;
- JSON serialization, because Express serializes the body before it writes the headers.

It leaves out everything before Express has the request (the network, TLS, Railway's edge proxy, and Node reading the request's headers) and everything after the headers are written (sending the body over the network).

**Client time** runs on the script's machine from just before `fetch` until the whole body has been read. It adds the network, TLS and Railway's edge to the server time. Node's `fetch` keeps the connection alive between requests, so opening it falls in the run's first request.

**One user, in sequence.** There is no load tool: the HR Manager makes one request at a time, and nobody asked a question about concurrency.

## The request list

The list is fixed in [`requests.ts`](../api/src/perf/requests.ts):

- `GET /api/employees`: the first page, the last page, a page filtered by country and department, and a name search.
- Each question endpoint, with and without filters where it takes any. Outliers is timed three ways: without parameters, underpaid only as the screen opens (which adds the cost to reach 0.80), and underpaid with filters. Pay statistics and the pay comparison require their parameters and payroll totals takes none, so each of those is timed once.

The filtered reads use Software Engineer II in India, which ties for the seed's largest peer group in [the headcount quotas](seed/headcount-quotas.md), so they are among the heaviest. The last page is found from the row count that the first page returns.

For each endpoint, in order: the first request is recorded as **cold**, then 3 warm-ups are sent and not recorded, then 100 sequential requests are timed. The results give cold, p50, p95 and max for server time and for client time. p50 and p95 are taken by nearest rank, so each is a measured sample: with 100 samples, p95 is the 95th fastest. Any response other than 200, or a missing `Server-Timing` header, stops the run without writing results.

## Running it against Railway

The run is done by hand, never in CI: shared CI runners make timings flaky, and the target is about the deployed app.

1. Check out the commit Railway is running, then `pnpm install` and `pnpm build`. The script runs from the build, and the results record the checkout's commit, so the two must match.
2. Restart the service from the Railway dashboard (see the cold-start procedure below).
3. Wait until `GET <baseUrl>/api/health` answers 200, then start the run at once, with no other request to the app in between.
4. Run:

   ```sh
   pnpm perf https://<app>.up.railway.app --region <the service's region> --seed-mode if-empty --client "<where this machine is, and its connection>"
   ```

   The script cannot find out the region, the seed mode or where it runs from, so each must be given. The region is in the service's settings. The seed mode is the one the start command uses unless the database was seeded another way.
5. Commit the regenerated `docs/performance-results.md`. The script exits with 1 when the run fails.

## The cold-start procedure

The script cannot restart Railway. It records the first request to each endpoint as cold, and that column reads as a cold start only when the run follows the procedure above: restart, wait for `/api/health`, run. Even then, only the first endpoint's cold request meets a freshly started process. Each later endpoint's cold request is the first to its own SQL and code path, in a process that has already served others. The cold column is reported, not judged.

## A smoke check on a local build

The script also runs against a local production build, as a check that it works, not as a measurement of the deployed app:

```sh
pnpm build
DATABASE_PATH=/tmp/acme-perf.db PORT=3000 pnpm start
pnpm perf http://localhost:3000 --region "none (local)" --seed-mode if-empty --client "the same machine as the server"
```

Such a run overwrites the results file too, so it is not committed.

## If the target is missed: the scaling exit

The design does not change shape at a larger headcount ([ADR 0002](adr/0002-persistence-and-computation-seams.md#where-statistics-are-computed)). The domain functions stay. Either SQL pre-aggregates per currency and passes the subtotals in, or the statistics are precomputed on write, since salary writes are rare and reads are frequent. Needing more than one instance is the trigger for moving from SQLite to Postgres.
