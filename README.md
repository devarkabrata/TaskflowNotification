# Notification Service

Email notification microservice for Taskflow. It consumes events published by other services (including the .NET `TaskFlowBackend` app) onto a shared AMQP broker, and sends transactional emails via SMTP. It does **not** expose any endpoint for publishing events — it is a pure consumer.

## Architecture

```
                                   ┌─────────────────────────────┐
                                   │   notifications.exchange    │
   Publishers (e.g. .NET app)      │         (topic)              │
   ──────────────────────────►     │                              │
   routing key: email.*            └───────┬───────┬───────┬──────┘
                                            │       │       │      │
                    email.task-created ─────┘       │       │      │
                                                     │       │      │
                    email.member-added ──────────────┘       │      │
                                                             │      │
                    email.team-created ──────────────────────┘      │
                                                                    │
                    email.forgot-password ───────────────────────────┘
                            │                │              │              │
                            ▼                ▼              ▼              ▼
                 ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ ┌──────────────────┐
                 │email.task-      │ │email.member-    │ │email.team-    │ │email.forgot-      │
                 │created.queue    │ │added.queue      │ │created.queue  │ │password.queue     │
                 └───────┬────────┘ └───────┬────────┘ └───────┬───────┘ └─────────┬─────────┘
                         │                  │                  │                   │
                         └────────── (Notification service consumers) ─────────────┘
                                              │
                                              ▼
                                    Controller → Service
                                    (parse → validate → template → send via Nodemailer, retry N times)
                                              │
                                  success ────┴──── all retries exhausted
                                    │                        │
                                    ▼                        ▼
                                  ack(msg)            nack(msg, requeue=false)
                                                               │
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │   notifications.dlx      │
                                                  │       (fanout)           │
                                                  └────────────┬─────────────┘
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │ email.dead-letter.queue  │
                                                  └─────────────────────────┘
```

Each of the 4 queues is declared durable with the argument `x-dead-letter-exchange: notifications.dlx`. Any message that is nacked without requeue (bad JSON, failed Zod validation, or Nodemailer retries exhausted) is automatically routed by RabbitMQ to the DLX, which fans out to the single dead-letter queue.

### Layering

```
src/
  config/       env loading + validation (Zod)
  connections/  AMQP connection manager, topology (exchange/queue/DLX declarations),
                SMTP transporter, generic consume/ack/nack runner
  controllers/  one per event type — parse JSON, validate, delegate to services/
  services/     MailerService (send + retry), NotificationService (template selection + dispatch)
  templates/    subject + HTML renderers, one per event type
  validations/  Zod schemas for the 4 event payloads
  helpers/      logger, sleep, common response envelope (ServiceResult)
  app.ts        Express app factory (GET /health)
  server.ts     composition root — manual dependency injection, AMQP bootstrap, SIGINT handling
```

Dependency injection is manual (no container library): `server.ts` is the single place where `MailerService`, `NotificationService`, and `AmqpConnectionManager` are constructed and wired together.

## Setup

```bash
cd Notification
npm install
cp .env.example .env    # then fill in AMQP_URL / SMTP_* / MAIL_FROM
npm run dev             # tsx watch src/server.ts
```

Requires a running RabbitMQ (or CloudMQ-compatible broker) reachable at `AMQP_URL`. For local testing:

```bash
docker run -d --hostname rmq --name rmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Run with `tsx watch` (auto-restarts on file change) |
| `npm start` | Run with `tsx` (no watch) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run publish:test` | Publish sample events via `test-publisher.ts` |

## Testing with `test-publisher.ts`

`test-publisher.ts` connects to the same exchange as a standalone publisher, so you can test the consumer pipeline without needing the real upstream publisher apps running.

```bash
# Publish one sample event for all 4 routing keys
npm run publish:test

# Publish a sample event for a single routing key
npm run publish:test -- email.task-created
npm run publish:test -- email.member-added
npm run publish:test -- email.team-created
npm run publish:test -- email.forgot-password
```

While `npm run dev` is running, you should see log lines for topology assertion, each consumer starting, and then a log line per message consumed/acked. Check your SMTP inbox (or a test SMTP tool like Mailtrap/Ethereal) for the resulting email.

To exercise the dead-letter path, publish an invalid payload (e.g. edit `test-publisher.ts` to omit a required field, or use the RabbitMQ management UI at `http://localhost:15672` to publish a malformed message directly to one of the queues) — it will be nacked without requeue and should appear in `email.dead-letter.queue`.

## Event payloads

All events share these base fields: `timestamp` (string), `to` (valid email), `from` (optional valid email — falls back to `MAIL_FROM` if omitted).

| Routing key | Queue | Extra fields |
|---|---|---|
| `email.task-created` | `email.task-created.queue` | `taskTitle` (string), `taskId` (string), `projectName` (string), `createdBy` (string) |
| `email.member-added` | `email.member-added.queue` | `workspaceName` (string), `memberName` (string), `invitedBy` (string) |
| `email.team-created` | `email.team-created.queue` | `teamName` (string), `createdBy` (string) |
| `email.forgot-password` | `email.forgot-password.queue` | `resetLink` (valid URL), `expiresInMinutes` (positive int, default `30`) |

## Publishing from a .NET app

Any service — including a .NET app using `RabbitMQ.Client` — can publish directly to `notifications.exchange` without going through this service. Example (`RabbitMQ.Client` v6/v7 style):

```csharp
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

var factory = new ConnectionFactory { Uri = new Uri("amqp://guest:guest@localhost:5672") };

using var connection = await factory.CreateConnectionAsync();
using var channel = await connection.CreateChannelAsync();

// Idempotent — matches the topology this service declares on startup.
await channel.ExchangeDeclareAsync(
    exchange: "notifications.exchange",
    type: ExchangeType.Topic,
    durable: true);

var payload = new
{
    timestamp = DateTime.UtcNow.ToString("o"),
    to = "recipient@example.com",
    taskTitle = "Design the onboarding flow",
    taskId = "task_12345",
    projectName = "Taskflow Web",
    createdBy = "Amit Roy"
};

var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload));

var properties = new BasicProperties
{
    ContentType = "application/json",
    DeliveryMode = DeliveryModes.Persistent
};

await channel.BasicPublishAsync(
    exchange: "notifications.exchange",
    routingKey: "email.task-created",
    mandatory: false,
    basicProperties: properties,
    body: body);
```

The routing key selects which queue (and therefore which email template) handles the event — use one of the 4 routing keys from the table above, with a JSON body matching that event's fields.
