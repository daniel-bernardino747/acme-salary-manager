/**
 * The FTS5 MATCH expression for a name search (ADR 0002, *Name search*): each word quoted and made
 * a prefix, and every word required. Raw input never reaches MATCH, so nothing typed is read as
 * FTS5 syntax.
 */
export function nameMatch(search: string): string {
  return search
    .trim()
    .split(/\s+/)
    .map((word) => `"${word.replaceAll('"', '""')}"*`)
    .join(' AND ');
}
