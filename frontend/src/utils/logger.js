/**
 * =====================================================================
 * Frontend Logger - Console + File Output
 * =====================================================================
 *
 * Logs to both console and accumulates logs for download
 * Since browsers can't write directly to filesystem, we:
 * 1. Log to console (as before)
 * 2. Store logs in memory
 * 3. Provide download functionality
 * 4. Auto-download on errors
 */

class FrontendLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 log entries
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = new Date();

    // Add initial session info
    this.logSessionStart();
  }

  logSessionStart() {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: '='.repeat(80),
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Frontend Logging Session Started`,
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Session ID: ${this.sessionId}`,
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Start Time: ${this.startTime.toLocaleString()}`,
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `User Agent: ${navigator.userAgent}`,
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `URL: ${window.location.href}`,
    });
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: '='.repeat(80),
    });
  }

  addLog(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({
      timestamp,
      level,
      message,
    });

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  log(...args) {
    this.addLog('INFO', ...args);
    console.log(...args);
  }

  info(...args) {
    this.addLog('INFO', ...args);
    console.log(...args);
  }

  warn(...args) {
    this.addLog('WARN', ...args);
    console.warn(...args);
  }

  error(...args) {
    this.addLog('ERROR', ...args);
    console.error(...args);
    // Auto-download logs on error (optional)
    // this.downloadLogs();
  }

  debug(...args) {
    this.addLog('DEBUG', ...args);
    console.debug(...args);
  }

  group(label) {
    this.addLog('GROUP', `>>> ${label}`);
    console.group(label);
  }

  groupEnd() {
    this.addLog('GROUP', `<<< GROUP END`);
    console.groupEnd();
  }

  /**
   * Get all logs as formatted text
   */
  getLogsAsText() {
    return this.logs.map(log =>
      `[${log.timestamp}] [${log.level.padEnd(5)}] ${log.message}`
    ).join('\n');
  }

  /**
   * Download logs as a text file
   */
  downloadLogs() {
    const text = this.getLogsAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frontend-logs-${this.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Logs downloaded:', a.download);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.logSessionStart();
    console.log('🗑️ Logs cleared');
  }

  /**
   * Get current log count
   */
  getLogCount() {
    return this.logs.length;
  }

  /**
   * Export logs to send to backend
   */
  async sendLogsToBackend() {
    try {
      const response = await fetch('http://localhost:8080/api/v1/logs/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          logs: this.logs,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });

      if (response.ok) {
        console.log('✅ Logs sent to backend successfully');
      }
    } catch (error) {
      console.warn('⚠️ Failed to send logs to backend:', error.message);
    }
  }
}

// Create singleton instance
const logger = new FrontendLogger();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.frontendLogger = logger;
  window.downloadLogs = () => logger.downloadLogs();
  window.clearLogs = () => logger.clearLogs();
  window.viewLogs = () => console.log(logger.getLogsAsText());
}

export default logger;

