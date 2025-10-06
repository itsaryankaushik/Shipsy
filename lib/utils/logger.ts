/**
 * Logger Utility
 * Simple console logger for development
 * In production, consider using Winston or Pino
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const IS_DEV = process.env.NODE_ENV === 'development';

class Logger {
  private logWithTimestamp(level: LogLevel, message: string, ...args: unknown[]) {
    if (!IS_DEV && level === 'debug') return; // Skip debug logs in production

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'info':
        console.log(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
    }
  }

  info(message: string, ...args: unknown[]) {
    this.logWithTimestamp('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.logWithTimestamp('warn', message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]) {
    if (error instanceof Error) {
      this.logWithTimestamp('error', message, {
        message: error.message,
        stack: error.stack,
        ...args,
      });
    } else {
      this.logWithTimestamp('error', message, error, ...args);
    }
  }

  debug(message: string, ...args: unknown[]) {
    this.logWithTimestamp('debug', message, ...args);
  }

  // Specific logging methods
  request(method: string, path: string, userId?: string) {
    this.info(`→ ${method} ${path}`, userId ? { userId } : {});
  }

  response(method: string, path: string, status: number, duration?: number) {
    const durationStr = duration ? `${duration}ms` : '';
    this.info(`← ${method} ${path} ${status} ${durationStr}`);
  }

  database(operation: string, table: string, duration?: number) {
    const durationStr = duration ? `(${duration}ms)` : '';
    this.debug(`DB: ${operation} on ${table} ${durationStr}`);
  }

  auth(action: string, userId?: string, success: boolean = true) {
    const status = success ? '✓' : '✗';
    this.info(`${status} AUTH: ${action}`, userId ? { userId } : {});
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
