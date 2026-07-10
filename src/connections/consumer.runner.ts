import type { Channel } from "amqplib";
import type { Logger } from "../helpers/logger.js";
import type { ServiceResult } from "../helpers/response.js";

export async function startConsumer(
  channel: Channel,
  queueName: string,
  handle: (content: Buffer) => Promise<ServiceResult>,
  logger: Logger
): Promise<void> {
  await channel.prefetch(1);

  await channel.consume(
    queueName,
    async (msg) => {
      if (!msg) return;

      const result = await handle(msg.content);

      if (result.success) {
        channel.ack(msg);
        logger.info(`[${queueName}] ${result.message}`);
      } else {
        logger.error(`[${queueName}] ${result.message}`, result.error);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  logger.info(`Consumer started for queue "${queueName}"`);
}
