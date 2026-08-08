import type { Channel } from "amqplib";
import type { AppConfig } from "../config/env.js";

export const ROUTING_KEYS = {
  TASK_CREATED: "email.task-created",
  MEMBER_ADDED: "email.member-added",
  TEAM_CREATED: "email.team-created",
  FORGOT_PASSWORD: "email.forgot-password",
  WELCOME_EMAIL: "email.welcome",
  OTP_EMAIL: "email.otp",
} as const;

export const QUEUE_NAMES = {
  TASK_CREATED: "email.task-created.queue",
  MEMBER_ADDED: "email.member-added.queue",
  TEAM_CREATED: "email.team-created.queue",
  FORGOT_PASSWORD: "email.forgot-password.queue",
  WELCOME_EMAIL: "email.welcome.queue",
  OTP_EMAIL: "email.otp.queue",
} as const;

export async function assertTopology(channel: Channel, amqp: AppConfig["amqp"]): Promise<void> {
  await channel.assertExchange(amqp.exchangeName, "topic", { durable: true });
  await channel.assertExchange(amqp.dlxName, "fanout", { durable: true });

  await channel.assertQueue(amqp.dlqName, { durable: true });
  await channel.bindQueue(amqp.dlqName, amqp.dlxName, "");

  const queueRoutingKeyPairs: Array<[string, string]> = [
    [QUEUE_NAMES.TASK_CREATED, ROUTING_KEYS.TASK_CREATED],
    [QUEUE_NAMES.MEMBER_ADDED, ROUTING_KEYS.MEMBER_ADDED],
    [QUEUE_NAMES.TEAM_CREATED, ROUTING_KEYS.TEAM_CREATED],
    [QUEUE_NAMES.FORGOT_PASSWORD, ROUTING_KEYS.FORGOT_PASSWORD],
    [QUEUE_NAMES.WELCOME_EMAIL, ROUTING_KEYS.WELCOME_EMAIL],
    [QUEUE_NAMES.OTP_EMAIL, ROUTING_KEYS.OTP_EMAIL],
  ];

  for (const [queueName, routingKey] of queueRoutingKeyPairs) {
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: { "x-dead-letter-exchange": amqp.dlxName },
    });
    await channel.bindQueue(queueName, amqp.exchangeName, routingKey);
  }
}
