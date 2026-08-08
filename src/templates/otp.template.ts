import type { OTPEmailEvent } from "../validations/event.schemas.js";
import { renderLayout } from "./layout.template.js";

export function renderOTPEmail(event: OTPEmailEvent): { subject: string; html: string } {
  const subject = `Check your OTP`;
  const html = renderLayout(
    subject,
    `<h2 style="margin-top:0;">Check your OTP for ${event.for}</h2>
     <h2 style="margin-top:0;">Your OTP is: <b>${event.otp}</b></h2>
     <p>${event.description}</p>
     <p>This OTP will expire in <b>${event.ttl}</b> minutes.</p>`
  );
  return { subject, html };
}
