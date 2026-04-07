'use client';

// ============= ERROR MONITORING =============

interface ErrorLog {
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

class ErrorMonitor {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  log(error: ErrorLog) {
    this.logs.push(error);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[${error.type.toUpperCase()}] ${error.message}`);
      console.log('Timestamp:', error.timestamp);
      if (error.stack) console.log('Stack:', error.stack);
      if (error.componentStack) console.log('Component Stack:', error.componentStack);
      console.log('URL:', error.url);
      console.groupEnd();
    }

    // Send to backend/monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(error);
    }
  }

  private async sendToBackend(error: ErrorLog) {
    try {
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      });
    } catch (err) {
      console.error('Failed to send error log:', err);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }

  getStats() {
    return {
      total: this.logs.length,
      errors: this.logs.filter(l => l.type === 'error').length,
      warnings: this.logs.filter(l => l.type === 'warning').length,
      info: this.logs.filter(l => l.type === 'info').length
    };
  }
}

// Global instance
export const errorMonitor = new ErrorMonitor();

// Setup global error handlers
export function setupErrorMonitoring() {
  if (typeof window === 'undefined') return;

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorMonitor.log({
      type: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    errorMonitor.log({
      type: 'error',
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  // Expose error monitor to window for debugging
  (window as any).__errorMonitor = errorMonitor;
}

// Hook to use monitoring
export function useErrorMonitoring() {
  return {
    log: (message: string, type: 'error' | 'warning' | 'info' = 'info') => {
      errorMonitor.log({
        type,
        message,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined
      });
    },
    getLogs: () => errorMonitor.getLogs(),
    getStats: () => errorMonitor.getStats()
  };
}
