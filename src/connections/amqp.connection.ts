import amqp, { type ChannelModel } from "amqplib";
import type { Logger } from "../helpers/logger.js";
import { sleep } from "../helpers/sleep.js";

export interface AmqpConnectionOptions {
  url: string;
  connectRetryAttempts: number;
  connectRetryDelayMs: number;
  reconnectDelayMs: number;
}

export class AmqpConnectionManager {

  private shuttingDown = false;
  private activeConnection: ChannelModel | undefined;
  private disconnectHandler: (() => Promise<void>) | undefined;
  private readonly options: AmqpConnectionOptions;
  private readonly logger: Logger;

  constructor(
    options: AmqpConnectionOptions,
    logger: Logger
  ) {
    this.options = options;
    this.logger = logger;
  }

  onDisconnect(handler: () => Promise<void>): void {
    this.disconnectHandler = handler;
  }

  async connect(): Promise<ChannelModel> {
    const { connectRetryAttempts, connectRetryDelayMs, url } = this.options;

    for (let attempt = 1; attempt <= connectRetryAttempts; attempt++) {
      try {
        const connection = await amqp.connect(url);
        this.logger.info("Connected to AMQP broker");
        this.activeConnection = connection;
        this.attachLifecycleHandlers(connection);
        return connection;
      } catch (err) {
        this.logger.error(
          `Failed to connect to AMQP broker (attempt ${attempt}/${connectRetryAttempts})`,
          err
        );
        if (attempt === connectRetryAttempts) {
          throw err;
        }
        await sleep(connectRetryDelayMs);
      }
    }

    throw new Error("Unreachable: AMQP connect retry loop exhausted without returning or throwing");
  }

  async close(): Promise<void> {
    this.shuttingDown = true;
    if (this.activeConnection) {
      await this.activeConnection.close();
    }
  }

  private attachLifecycleHandlers(connection: ChannelModel): void {
    connection.on("error", (err) => {
      this.logger.error("AMQP connection error", err);
    });

    connection.on("close", () => {
      if (this.shuttingDown) {
        this.logger.info("AMQP connection closed (shutdown in progress)");
        return;
      }

      this.logger.warn("AMQP connection closed unexpectedly, attempting to reconnect");
      void this.reconnect();
    });
  }

  private async reconnect(): Promise<void> {
    await sleep(this.options.reconnectDelayMs);

    try {
      await this.connect();
      if (this.disconnectHandler) {
        await this.disconnectHandler();
      }
    } catch (err) {
      this.logger.error("Reconnect attempt failed, retrying", err);
      if (!this.shuttingDown) {
        void this.reconnect();
      }
    }
  }
}
