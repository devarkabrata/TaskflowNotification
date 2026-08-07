import type { WelcomeEmailEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderWelcomeEmail(event: WelcomeEmailEvent): { subject: string; html: string } {
  const subject = `Welcome, ${event.userName}!`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">Welcome to our platform, ${event.userName}!</h2>
     <p>${event.welcomeMessage}</p>`
  );
  return { subject, html };
}
