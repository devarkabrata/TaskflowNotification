import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),

  AMQP_URL: z.string().min(1, "AMQP_URL is required"),
  EXCHANGE_NAME: z.string().default("notifications.exchange"),
  DLX_NAME: z.string().default("notifications.dlx"),
  DLQ_NAME: z.string().default("email.dead-letter.queue"),
  AMQP_CONNECT_RETRY_ATTEMPTS: z.coerce.number().int().positive().default(10),
  AMQP_CONNECT_RETRY_DELAY_MS: z.coerce.number().int().positive().default(3000),
  AMQP_RECONNECT_DELAY_MS: z.coerce.number().int().positive().default(5000),
 
  SENDGRID_API_KEY: z.string().min(1, "SENDGRID_API_KEY is required"),
  MAIL_FROM: z.string().min(1, "MAIL_FROM is required"),

  MAX_RETRY_ATTEMPTS: z.coerce.number().int().positive().default(3),
  RETRY_DELAY_MS: z.coerce.number().int().positive().default(2000),
});

export type EnvSchema = z.infer<typeof envSchema>;
