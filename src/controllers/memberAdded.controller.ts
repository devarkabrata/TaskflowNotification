import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { memberAddedSchema } from "../validations/event.schemas.js";

export function createMemberAddedController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for member-added event", err);
    }

    const parsed = memberAddedSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for member-added event", parsed.error);
    }

    try {
      await notificationService.sendMemberAddedEmail(parsed.data);
      return success("Member added email sent");
    } catch (err) {
      return fail("Failed to send member added email after retries", err);
    }
  };
}
