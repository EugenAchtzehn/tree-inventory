export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'NOT_FOUND'
  | 'STORAGE'
  | 'UNKNOWN'

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly retriable = false,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function toAppError(error: unknown, fallback = '發生未預期的錯誤'): AppError {
  if (error instanceof AppError) return error
  return new AppError('UNKNOWN', error instanceof Error ? error.message : fallback, true)
}
