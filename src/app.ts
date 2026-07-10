import express, { type Express } from "express";
import { success } from "./helpers/response.js";

export function createApp(): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    res.status(200).json(success("Notification service is healthy", { uptime: process.uptime() }));
  });

  return app;
}
