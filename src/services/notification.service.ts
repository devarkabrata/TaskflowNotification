import type { Logger } from "../helpers/logger.js";

import { renderForgotPasswordEmail } from "../templates/forgotPassword.template.js";
import { renderMemberAddedEmail } from "../templates/memberAdded.template.js";
import { renderTaskCreatedEmail } from "../templates/taskCreated.template.js";
import { renderTeamCreatedEmail } from "../templates/teamCreated.template.js";
import { renderWelcomeEmail } from "../templates/welcome.template.js";

import type {
  ForgotPasswordEvent,
  MemberAddedEvent,
  TaskCreatedEvent,
  TeamCreatedEvent,
  WelcomeEmailEvent,
} from "../validations/event.schemas.js";

import type { MailerService } from "./mailer.service.js";

export class NotificationService {

  private readonly mailerService: MailerService;
  private readonly mailFrom: string;
  private readonly logger: Logger;

  constructor(
    mailerService: MailerService,
    mailFrom: string,
    logger: Logger
  ) {
    this.mailerService = mailerService;
    this.mailFrom = mailFrom;
    this.logger = logger;
  }

  async sendTaskCreatedEmail(event: TaskCreatedEvent): Promise<void> {
    const { subject, html } = renderTaskCreatedEmail(event);
    await this.dispatch(event.to, event.from, subject, html);
  }

  async sendMemberAddedEmail(event: MemberAddedEvent): Promise<void> {
    const { subject, html } = renderMemberAddedEmail(event);
    await this.dispatch(event.to, event.from, subject, html);
  }

  async sendTeamCreatedEmail(event: TeamCreatedEvent): Promise<void> {
    const { subject, html } = renderTeamCreatedEmail(event);
    await this.dispatch(event.to, event.from, subject, html);
  }

  async sendForgotPasswordEmail(event: ForgotPasswordEvent): Promise<void> {
    const { subject, html } = renderForgotPasswordEmail(event);
    await this.dispatch(event.to, event.from, subject, html);
  }

  async sendWelcomeEmail(event: WelcomeEmailEvent): Promise<void> {
    const { subject, html } = renderWelcomeEmail(event);
    await this.dispatch(event.to, event.from, subject, html);
  }

  private async dispatch(to: string, from: string | undefined, subject: string, html: string): Promise<void> {
    await this.mailerService.send({
      from: from ?? this.mailFrom,
      to,
      subject,
      html,
    });
    this.logger.info(`Email dispatched to ${to}: ${subject}`);
  }
}
