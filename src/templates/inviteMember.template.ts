import type { InviteMemberEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderInviteMemberEmail(event: InviteMemberEvent): { subject: string; html: string } {
  const subject = `You have been invited to join: ${event.workspaceName}`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">You have been invited to join ${event.workspaceName}</h2>
     <p>Hello ${event.userName},</p>
     <p>You have been invited by <b>${event.invitedBy}</b> to join their workspace.</p>
     <p style="margin-top:20px;padding:10px;background-color:#f0f0f0;border-radius:5px;color:#333;"><a href="${event.inviteLink}&action=accept" target="_blank">Accept Invitation</a></p>
     <p style="margin-top:10px;padding:10px;background-color:#f0f0f0;border-radius:5px;color:#333;"><a href="${event.inviteLink}&action=decline" target="_blank">Decline Invitation</a></p>
     <p style="margin-top:20px;">If you did not expect this invitation, you can safely ignore this email.</p>`
  );
  return { subject, html };
}