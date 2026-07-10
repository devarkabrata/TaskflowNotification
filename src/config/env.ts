import dotenv from "dotenv";
import { envSchema } from "./env.schema.js";

export interface AppConfig {
  port: number;
  amqp: {
    url: string;
    exchangeName: string;
    dlxName: string;
    dlqName: string;
    connectRetryAttempts: number;
    connectRetryDelayMs: number;
    reconnectDelayMs: number;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  mail: {
    from: string;
  };
  retry: {
    maxAttempts: number;
    delayMs: number;
  };
}

export function loadConfig(): AppConfig {
  dotenv.config();

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  const env = parsed.data;

  return {
    port: env.PORT,
    amqp: {
      url: env.AMQP_URL,
      exchangeName: env.EXCHANGE_NAME,
      dlxName: env.DLX_NAME,
      dlqName: env.DLQ_NAME,
      connectRetryAttempts: env.AMQP_CONNECT_RETRY_ATTEMPTS,
      connectRetryDelayMs: env.AMQP_CONNECT_RETRY_DELAY_MS,
      reconnectDelayMs: env.AMQP_RECONNECT_DELAY_MS,
    },
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    mail: {
      from: env.MAIL_FROM,
    },
    retry: {
      maxAttempts: env.MAX_RETRY_ATTEMPTS,
      delayMs: env.RETRY_DELAY_MS,
    },
  };
}
