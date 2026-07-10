import { fail, success, type ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { taskCreatedSchema } from "../validations/event.schemas.js";

export function createTaskCreatedController(notificationService: NotificationService) {
  return async function handle(content: Buffer): Promise<ServiceResult> {
    let json: unknown;
    try {
      json = JSON.parse(content.toString("utf-8"));
    } catch (err) {
      return fail("Invalid JSON payload for task-created event", err);
    }

    const parsed = taskCreatedSchema.safeParse(json);
    if (!parsed.success) {
      return fail("Validation failed for task-created event", parsed.error);
    }

    try {
      await notificationService.sendTaskCreatedEmail(parsed.data);
      return success("Task created email sent");
    } catch (err) {
      return fail("Failed to send task created email after retries", err);
    }
  };
}
