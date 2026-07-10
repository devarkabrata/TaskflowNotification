import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { AmqpConnectionManager } from "./connections/amqp.connection.js";
import { createMailTransporter } from "./connections/mail.connection.js";
import { startConsumer } from "./connections/consumer.runner.js";
import { assertTopology } from "./connections/topology.js";
import { buildControllers } from "./controllers/index.js";
import { createLogger } from "./helpers/logger.js";
import { MailerService } from "./services/mailer.service.js";
import { NotificationService } from "./services/notification.service.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger("notification-service");

  // create mail transporter
  const transporter = createMailTransporter(config.smtp);

  // Initialize services
  const mailerService = new MailerService(transporter, config.retry, logger);
  const notificationService = new NotificationService(mailerService, config.mail.from, logger);

  const amqpManager = new AmqpConnectionManager(config.amqp, logger);

  async function bootstrapBroker(): Promise<void> {
    const connection = await amqpManager.connect();
    const channel = await connection.createChannel();
    await assertTopology(channel, config.amqp);

    for (const definition of buildControllers(notificationService)) {
      await startConsumer(channel, definition.queueName, definition.handle, logger);
    }
  }

  amqpManager.onDisconnect(bootstrapBroker);
  await bootstrapBroker();

  const app = createApp();
  const httpServer = app.listen(config.port, () => {
    logger.info(`Notification service listening on port ${config.port}`);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    void (async () => {
      await amqpManager.close();
      httpServer.close(() => process.exit(0));
    })();
  });
}

main().catch((err) => {
  console.error("Fatal error during startup", err);
  process.exit(1);
});
