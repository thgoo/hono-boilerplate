import type { Logger } from './types';

export class ConsoleLogger implements Logger {
  private shouldLog(): boolean {
    return process.env.NODE_ENV !== 'test';
  }

  private log(level: string, message: string, meta?: Record<string, unknown>) {
    if (!this.shouldLog()) return;

    const logData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    const output = level === 'error' ? console.error : console.log;
    output(JSON.stringify(logData));
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log('debug', message, meta);
  }
}
