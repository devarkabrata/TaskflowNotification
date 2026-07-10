import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { forgotPasswordSchema } from "../validations/event.schemas.js";

export function createForgotPasswordController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for forgot-password event", err);
    }

    const parsed = forgotPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for forgot-password event", parsed.error);
    }

    try {
      await notificationService.sendForgotPasswordEmail(parsed.data);
      return success("Forgot password email sent");
    } catch (err) {
      return fail("Failed to send forgot password email after retries", err);
    }
  };
}
