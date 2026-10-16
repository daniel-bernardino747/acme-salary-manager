import { ApiProblem } from './api-fetch';

/** What a failed request says to the HR Manager: the problem's own message, or a lost connection. */
export function errorText(error: Error): string {
  if (error instanceof ApiProblem) {
    return error.message;
  }
  return 'The server could not be reached. Check your connection and try again.';
}
