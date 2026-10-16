import { countries, jobTitles } from '@acme/contract';
import { homeDepartment } from './home-departments';
import type { Quota } from './quotas';

// The generated snapshots under docs/seed/ (ADR 0005). Tests compare them with the functions'
// output; regenerate with `pnpm --filter @acme/api exec vitest run -u src/seed`.

const REGENERATE = 'pnpm --filter @acme/api exec vitest run -u src/seed';
const count = new Intl.NumberFormat('en');

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const align = header.map((_, i) => (i < 2 ? '---' : '---:'));
  return [header, align, ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n');
}

/** The headcount of every title and country, with row and column totals, as Markdown. */
export function quotaSnapshot(quotas: readonly Quota[]): string {
  const countOf = (jobTitle: string, country: string) =>
    quotas.find((q) => q.jobTitle === jobTitle && q.country === country)?.count ?? 0;
  const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);
  const codes = countries.map((c) => c.code);
  const rows = jobTitles.map((t) => {
    const cells = codes.map((c) => countOf(t, c));
    return [t, homeDepartment[t], ...cells.map((n) => count.format(n)), count.format(sum(cells))];
  });
  const totals = codes.map((c) => sum(jobTitles.map((t) => countOf(t, c))));
  rows.push([
    '**Total**',
    '',
    ...totals.map((n) => `**${count.format(n)}**`),
    `**${count.format(sum(totals))}**`,
  ]);
  return [
    '# Headcount quotas',
    '',
    `Generated from \`headcountQuotas()\` (ADR 0005, *Headcount: exact quotas*). Do not edit: \`${REGENERATE}\` rewrites it, and \`api/src/seed/quotas.spec.ts\` fails when it is stale.`,
    '',
    table(['Job title', 'Department', ...codes, 'Total'], rows),
    '',
  ].join('\n');
}
