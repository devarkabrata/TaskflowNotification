import type { SendMailOptions, Transporter } from "nodemailer";
import type { Logger } from "../helpers/logger.js";
import { sleep } from "../helpers/sleep.js";

export interface MailerServiceOptions {
  maxAttempts: number;
  delayMs: number;
}

export class MailerService {
  
  private readonly transporter: Transporter;
  private readonly options: MailerServiceOptions;
  private readonly logger: Logger;
  
  constructor(
    transporter: Transporter,
    options: MailerServiceOptions,
    logger: Logger
  ) {
    this.transporter = transporter;
    this.options = options;
    this.logger = logger;
  }

  async send(mailOptions: SendMailOptions): Promise<void> {
    const { maxAttempts, delayMs } = this.options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.transporter.sendMail(mailOptions);
        return;
      } catch (err) {
        this.logger.error(
          `Failed to send email to ${String(mailOptions.to)} (attempt ${attempt}/${maxAttempts})`,
          err
        );

        if (attempt === maxAttempts) {
          throw err;
        }

        await sleep(delayMs);
      }
    }
  }
}
