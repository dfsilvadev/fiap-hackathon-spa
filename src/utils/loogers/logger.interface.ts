/**
 * Logger Interface
 * Contract for logger implementations
 */
export interface ILogger {
  success(_message: string, ..._args: unknown[]): void
  error(_message: string, ..._args: unknown[]): void
  warning(_message: string, ..._args: unknown[]): void
  info(_message: string, ..._args: unknown[]): void
  debug(_message: string, ..._args: unknown[]): void
}
