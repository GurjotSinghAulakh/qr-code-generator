export class UserError extends Error {}
export function userMessage(error: unknown, fallback = 'This operation could not finish. Try again or use a smaller file.'): string {
  return error instanceof UserError ? error.message : fallback;
}
