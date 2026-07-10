import type { TaskCreatedEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderTaskCreatedEmail(event: TaskCreatedEvent): { subject: string; html: string } {
  const subject = `New task created: ${event.taskTitle}`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">A new task has been created</h2>
     <p><strong>${event.createdBy}</strong> created a new task in <strong>${event.teamName}</strong>.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">
       <tr><td style="padding:4px 0;color:#6b7280;">Task</td><td style="padding:4px 0 4px 12px;font-weight:bold;">${event.taskTitle}</td></tr>
       <tr><td style="padding:4px 0;color:#6b7280;">Task ID</td><td style="padding:4px 0 4px 12px;">${event.taskId}</td></tr>
       <tr><td style="padding:4px 0;color:#6b7280;">Team</td><td style="padding:4px 0 4px 12px;">${event.teamName}</td></tr>
     </table>`
  );
  return { subject, html };
}
