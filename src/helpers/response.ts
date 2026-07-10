export type ServiceResult<T = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error?: string };

export function success<T = undefined>(message: string, data?: T): ServiceResult<T> {
  return { success: true, message, data: data as T };
}

export function fail(message: string, error?: unknown): ServiceResult<never> {
  return { success: false, message, error: normalizeError(error) };
}

function normalizeError(error: unknown): string | undefined {
  if (error === undefined) return undefined;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
