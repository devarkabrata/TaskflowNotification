import { z } from "zod";

export const baseEventSchema = z.object({
  timestamp: z.string(),
  to: z.string().email(),
  from: z.string().email().optional(),
});

export const taskCreatedSchema = baseEventSchema.extend({
  taskTitle: z.string(),
  taskId: z.string(),
  teamName: z.string(),
  expirationDate: z.string(),
  createdBy: z.string(),
});

export const memberAddedSchema = baseEventSchema.extend({
  workspaceName: z.string(),
  memberName: z.string(),
  invitedBy: z.string(),
});

export const teamCreatedSchema = baseEventSchema.extend({
  teamName: z.string(),
  createdBy: z.string(),
});

export const forgotPasswordSchema = baseEventSchema.extend({
  resetLink: z.string().url(),
  expiresInMinutes: z.number().int().positive().default(30),
});

export type TaskCreatedEvent = z.infer<typeof taskCreatedSchema>;
export type MemberAddedEvent = z.infer<typeof memberAddedSchema>;
export type TeamCreatedEvent = z.infer<typeof teamCreatedSchema>;
export type ForgotPasswordEvent = z.infer<typeof forgotPasswordSchema>;
