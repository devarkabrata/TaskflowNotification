import type { ForgotPasswordEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderForgotPasswordEmail(event: ForgotPasswordEvent): { subject: string; html: string } {
  const subject = "Reset your password";
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">Reset your password</h2>
     <p>We received a request to reset your password. This link expires in <strong>${event.expiresInMinutes} minutes</strong>.</p>
     <p style="margin:24px 0;">
       <a href="${event.resetLink}" style="background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Reset Password</a>
     </p>
     <p style="color:#6b7280;font-size:12px;">If you did not request this, you can safely ignore this email.</p>`
  );
  return { subject, html };
}
