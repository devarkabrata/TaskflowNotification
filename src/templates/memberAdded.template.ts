import type { MemberAddedEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderMemberAddedEmail(event: MemberAddedEvent): { subject: string; html: string } {
  const subject = `You've been added to ${event.workspaceName}`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">Welcome to ${event.workspaceName}</h2>
     <p><strong>${event.invitedBy}</strong> added <strong>${event.memberName}</strong> to the <strong>${event.workspaceName}</strong> workspace.</p>`
  );
  return { subject, html };
}
