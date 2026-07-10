import { QUEUE_NAMES, ROUTING_KEYS } from "../connections/topology.js";
import type { ServiceResult } from "../helpers/response.js";
import type { NotificationService } from "../services/notification.service.js";
import { createForgotPasswordController } from "./forgotPassword.controller.js";
import { createMemberAddedController } from "./memberAdded.controller.js";
import { createTaskCreatedController } from "./taskCreated.controller.js";
import { createTeamCreatedController } from "./teamCreated.controller.js";

export interface EventControllerDefinition {
  routingKey: string;
  queueName: string;
  handle: (content: Buffer) => Promise<ServiceResult>;
}

export function buildControllers(notificationService: NotificationService): EventControllerDefinition[] {
  return [
    {
      routingKey: ROUTING_KEYS.TASK_CREATED,
      queueName: QUEUE_NAMES.TASK_CREATED,
      handle: createTaskCreatedController(notificationService),
    },
    {
      routingKey: ROUTING_KEYS.MEMBER_ADDED,
      queueName: QUEUE_NAMES.MEMBER_ADDED,
      handle: createMemberAddedController(notificationService),
    },
    {
      routingKey: ROUTING_KEYS.TEAM_CREATED,
      queueName: QUEUE_NAMES.TEAM_CREATED,
      handle: createTeamCreatedController(notificationService),
    },
    {
      routingKey: ROUTING_KEYS.FORGOT_PASSWORD,
      queueName: QUEUE_NAMES.FORGOT_PASSWORD,
      handle: createForgotPasswordController(notificationService),
    },
  ];
}
