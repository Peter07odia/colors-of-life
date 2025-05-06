/**
 * Application Logger Service
 * Provides consistent logging patterns across the application
 * Can be extended to send logs to an external service in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const MAX_LOG_HISTORY = 100;

class Logger {
  private logHistory: LogEntry[] = [];
  
  constructor() {
    // In development mode, keep logs between hot reloads
    if (typeof window !== 'undefined' && !isProduction) {
      const savedLogs = window.sessionStorage.getItem('app_logs');
      if (savedLogs) {
        try {
          this.logHistory = JSON.parse(savedLogs);
        } catch (e) {
          console.warn('Failed to parse saved logs');
        }
      }
    }
  }
  
  /**
   * Creates a log entry
   */
  private createEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
    
    this.logHistory.unshift(entry);
    
    // Limit history size
    if (this.logHistory.length > MAX_LOG_HISTORY) {
      this.logHistory = this.logHistory.slice(0, MAX_LOG_HISTORY);
    }
    
    // In development, persist logs in session storage
    if (typeof window !== 'undefined' && !isProduction) {
      try {
        window.sessionStorage.setItem('app_logs', JSON.stringify(this.logHistory));
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    return entry;
  }
  
  /**
   * Log debug information
   */
  debug(message: string, data?: any, context?: string): void {
    if (isProduction) return; // Skip debug logs in production
    
    const entry = this.createEntry('debug', message, data, context);
    console.debug(`[DEBUG]${context ? ` [${context}]` : ''}: ${message}`, data || '');
  }
  
  /**
   * Log general information
   */
  info(message: string, data?: any, context?: string): void {
    const entry = this.createEntry('info', message, data, context);
    
    if (!isProduction || data) {
      console.info(`[INFO]${context ? ` [${context}]` : ''}: ${message}`, data || '');
    }
    
    // In production, you might want to send important info logs to a service
    if (isProduction && context === 'important') {
      this.sendToAnalyticsService(entry);
    }
  }
  
  /**
   * Log warnings
   */
  warn(message: string, data?: any, context?: string): void {
    const entry = this.createEntry('warn', message, data, context);
    console.warn(`[WARN]${context ? ` [${context}]` : ''}: ${message}`, data || '');
    
    // In production, you might want to send warnings to a service
    if (isProduction) {
      this.sendToAnalyticsService(entry);
    }
  }
  
  /**
   * Log errors
   */
  error(message: string, error?: any, context?: string): void {
    let errorData = error;
    
    // Extract useful information from Error objects
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any) // Include any custom properties
      };
    }
    
    const entry = this.createEntry('error', message, errorData, context);
    console.error(`[ERROR]${context ? ` [${context}]` : ''}: ${message}`, error || '');
    
    // Always send errors to monitoring service in production
    if (isProduction) {
      this.sendToErrorService(entry);
    }
  }
  
  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }
  
  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
    
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('app_logs');
    }
  }
  
  /**
   * Send to error monitoring service (placeholder)
   */
  private sendToErrorService(entry: LogEntry): void {
    // In a real app, send to Sentry, LogRocket, etc.
    // Example: Sentry.captureException(entry.data, { 
    //   level: entry.level, 
    //   tags: { context: entry.context } 
    // });
  }
  
  /**
   * Send to analytics service (placeholder)
   */
  private sendToAnalyticsService(entry: LogEntry): void {
    // In a real app, send to analytics service
    // Example: Analytics.trackEvent('log', { 
    //   level: entry.level, 
    //   message: entry.message,
    //   context: entry.context 
    // });
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export a hook for component usage
export function useLogger(context?: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(message, data, context),
    info: (message: string, data?: any) => logger.info(message, data, context),
    warn: (message: string, data?: any) => logger.warn(message, data, context),
    error: (message: string, error?: any) => logger.error(message, error, context),
  };
} 