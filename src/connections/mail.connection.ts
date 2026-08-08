import sgMail from "@sendgrid/mail";
import type { MailTransport } from "../services/mailer.service.js";

export function createMailTransporter(apiKey: string): MailTransport {
  sgMail.setApiKey(apiKey);

  return {
    async sendMail(message) {
      await sgMail.send(message);
    },
  };
}
