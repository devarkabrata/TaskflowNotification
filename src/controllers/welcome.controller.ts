import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { welcomeEmailSchema } from "../validations/event.schemas.js";

export function WelcomeEmailController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for welcome email event", err);
    }

    const parsed = welcomeEmailSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for welcome email event", parsed.error);
    }

    try {
      await notificationService.sendWelcomeEmail(parsed.data);
      return success("Welcome email sent");
    } catch (err) {
      return fail("Failed to send welcome email after retries", err);
    }
  };
}
