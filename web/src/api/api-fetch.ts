/** Sends a request to the API and returns its JSON body, typed by the caller (ADR 0004). */
export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  return (await response.json()) as T;
}
