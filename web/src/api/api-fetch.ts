/** Sends a request to the API and returns its JSON body, typed by the caller (ADR 0004). */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, headers: { Accept: 'application/json' } });
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
