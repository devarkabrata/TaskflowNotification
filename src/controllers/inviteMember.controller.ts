import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { InviteMemberSchema } from "../validations/event.schemas.js";

export function createInviteMemberController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for invite-member event", err);
    }

    const parsed = InviteMemberSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for invite-member event", parsed.error);
    }

    try {
      await notificationService.sendInviteMemberEmail(parsed.data);
      return success("Invite member email sent");
    } catch (err) {
      return fail("Failed to send invite member email after retries", err);
    }
  };
}
