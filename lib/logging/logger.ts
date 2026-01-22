type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const formattedMessage = this.formatMessage(level, message, context);

    if (error) {
      const errorContext = {
        ...context,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      };
      console[level === "error" ? "error" : "log"](this.formatMessage(level, message, errorContext));
    } else {
      console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](formattedMessage);
    }

    // In production, you would send to a logging service (e.g., Sentry, LogRocket, etc.)
    if (!this.isDevelopment && level === "error") {
      // TODO: Send to error tracking service
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();
