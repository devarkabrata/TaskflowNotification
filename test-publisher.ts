import amqp from "amqplib";
import { loadConfig } from "./src/config/env.js";
import { ROUTING_KEYS } from "./src/connections/topology.js";

const now = new Date().toISOString();

const samplePayloads: Record<string, unknown> = {
  [ROUTING_KEYS.TASK_CREATED]: {
    timestamp: now,
    to: "recipient@example.com",
    taskTitle: "Design the onboarding flow",
    taskId: "task_12345",
    projectName: "Taskflow Web",
    createdBy: "Amit Roy",
  },
  [ROUTING_KEYS.MEMBER_ADDED]: {
    timestamp: now,
    to: "recipient@example.com",
    workspaceName: "Product Team",
    memberName: "Jordan Lee",
    invitedBy: "Amit Roy",
  },
  [ROUTING_KEYS.TEAM_CREATED]: {
    timestamp: now,
    to: "recipient@example.com",
    teamName: "Platform Engineering",
    createdBy: "Amit Roy",
  },
  [ROUTING_KEYS.FORGOT_PASSWORD]: {
    timestamp: now,
    to: "recipient@example.com",
    resetLink: "https://taskflow.example.com/reset-password?token=abc123",
    expiresInMinutes: 30,
  },
};

async function main(): Promise<void> {
  const config = loadConfig();
  const requestedKey = process.argv[2];

  if (requestedKey && !samplePayloads[requestedKey]) {
    console.error(`Unknown routing key "${requestedKey}". Valid keys: ${Object.keys(samplePayloads).join(", ")}`);
    process.exit(1);
  }

  const connection = await amqp.connect(config.amqp.url);
  const channel = await connection.createChannel();
  await channel.assertExchange(config.amqp.exchangeName, "topic", { durable: true });

  const entries = requestedKey
    ? [[requestedKey, samplePayloads[requestedKey]] as [string, unknown]]
    : Object.entries(samplePayloads);

  for (const [routingKey, payload] of entries) {
    const published = channel.publish(
      config.amqp.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { contentType: "application/json", persistent: true }
    );
    console.log(`Published to routing key "${routingKey}": ${published ? "ok" : "buffer full"}`);
  }

  await channel.close();
  await connection.close();
}

main().catch((err) => {
  console.error("Failed to publish test events", err);
  process.exit(1);
});
