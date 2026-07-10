import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { teamCreatedSchema } from "../validations/event.schemas.js";

export function createTeamCreatedController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for team-created event", err);
    }

    const parsed = teamCreatedSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for team-created event", parsed.error);
    }

    try {
      await notificationService.sendTeamCreatedEmail(parsed.data);
      return success("Team created email sent");
    } catch (err) {
      return fail("Failed to send team created email after retries", err);
    }
  };
}
