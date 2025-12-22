// Simple logging utility for monitoring and debugging
// In production, consider integrating with services like Sentry, LogDNA, or Datadog

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// In-memory log buffer for recent logs (last 100 entries)
const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

// Log level priorities
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (can be set via environment variable)
const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const context = entry.context ? ` [${entry.context}]` : '';
  let message = `${prefix}${context} ${entry.message}`;

  if (entry.data) {
    message += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
  }

  if (entry.error) {
    message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack) {
      message += `\n  Stack: ${entry.error.stack}`;
    }
  }

  return message;
}

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
  };
}

export const logger = {
  debug(message: string, context?: string, data?: unknown): void {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, context, data);
    addToBuffer(entry);
    console.debug(formatLog(entry));
  },

  info(message: string, context?: string, data?: unknown): void {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, context, data);
    addToBuffer(entry);
    console.info(formatLog(entry));
  },

  warn(message: string, context?: string, data?: unknown): void {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, context, data);
    addToBuffer(entry);
    console.warn(formatLog(entry));
  },

  error(message: string, error?: Error | unknown, context?: string, data?: unknown): void {
    if (!shouldLog('error')) return;
    const errorObj = error instanceof Error ? error : undefined;
    const entry = createLogEntry('error', message, context, data, errorObj);
    addToBuffer(entry);
    console.error(formatLog(entry));
  },

  // Get recent logs (useful for debugging API endpoint)
  getRecentLogs(count = 50): LogEntry[] {
    return logBuffer.slice(-count);
  },

  // Clear log buffer
  clearBuffer(): void {
    logBuffer.length = 0;
  },
};

// Performance timing helper
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
  context?: string
): T | Promise<T> {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = performance.now() - start;
      logger.debug(`${name} completed in ${duration.toFixed(2)}ms`, context, { duration });
      return value;
    }).catch((error) => {
      const duration = performance.now() - start;
      logger.error(`${name} failed after ${duration.toFixed(2)}ms`, error, context);
      throw error;
    });
  }

  const duration = performance.now() - start;
  logger.debug(`${name} completed in ${duration.toFixed(2)}ms`, context, { duration });
  return result;
}

// API error response helper
export function createErrorResponse(
  message: string,
  status: number = 500,
  error?: Error
): { success: false; error: string; status: number } {
  if (error) {
    logger.error(message, error, 'API');
  }
  return {
    success: false,
    error: message,
    status,
  };
}

export default logger;
