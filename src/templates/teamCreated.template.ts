import type { TeamCreatedEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderTeamCreatedEmail(event: TeamCreatedEvent): { subject: string; html: string } {
  const subject = `New team created: ${event.teamName}`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">A new team has been created</h2>
     <p><strong>${event.createdBy}</strong> created the <strong>${event.teamName}</strong> team.</p>`
  );
  return { subject, html };
}
