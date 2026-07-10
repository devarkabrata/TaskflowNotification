export interface Logger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export function createLogger(scope: string): Logger {
  const write = (level: "INFO" | "WARN" | "ERROR", message: string, meta?: unknown) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] [${scope}] ${message}`;
    if (meta !== undefined) {
      console.log(line, meta);
    } else {
      console.log(line);
    }
  };

  return {
    info: (message, meta) => write("INFO", message, meta),
    warn: (message, meta) => write("WARN", message, meta),
    error: (message, meta) => write("ERROR", message, meta),
  };
}
