import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { OTPEmailSchema, welcomeEmailSchema } from "../validations/event.schemas.js";

export function OTPEmailController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for OTP email event", err);
    }

    const parsed = OTPEmailSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for OTP email event", parsed.error);
    }

    try {
      await notificationService.sendOTPEmail(parsed.data);
      return success("OTP email sent");
    } catch (err) {
      return fail("Failed to send OTP email after retries", err);
    }
  };
}
