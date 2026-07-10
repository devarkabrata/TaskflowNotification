import nodemailer, { type Transporter } from "nodemailer";
import type { AppConfig } from "../config/env.js";

export function createMailTransporter(smtp: AppConfig["smtp"]): Transporter {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth:
      smtp.user || smtp.pass
        ? {
            user: smtp.user,
            pass: smtp.pass,
          }
        : undefined,
  });
}
