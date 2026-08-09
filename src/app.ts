import express, { type Express } from "express";
import { success } from "./helpers/response.js";
import cors from "cors";

export function createApp(): Express {
  const app = express();

  app.use(cors());

  app.head("/health", (_req, res) => {
    res.status(200).json(success("Notification service is healthy", { uptime: process.uptime() }));
  });

  return app;
}
