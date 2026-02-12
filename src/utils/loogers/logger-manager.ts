import { ConsoleLogger } from './console-logger'
import type { ILogger } from './logger.interface'

/**
 * Logger Manager
 * Singleton para gerenciar a implementação do logger
 */
class LoggerManager {
  private implementation: ILogger

  constructor() {
    this.implementation = new ConsoleLogger()
  }

  setImplementation(implementation: ILogger): void {
    this.implementation = implementation
  }

  success(message: string, ...args: unknown[]): void {
    this.implementation.success(message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.implementation.error(message, ...args)
  }

  warning(message: string, ...args: unknown[]): void {
    this.implementation.warning(message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.implementation.info(message, ...args)
  }

  debug(message: string, ...args: unknown[]): void {
    this.implementation.debug(message, ...args)
  }
}

export const logger = new LoggerManager()
