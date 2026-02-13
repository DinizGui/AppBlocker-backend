import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { config } from "./lib/config.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { tasksRouter } from "./routes/tasks.js";
import { projectsRouter } from "./routes/projects.js";
import { remindersRouter } from "./routes/reminders.js";
import { notificationsRouter } from "./routes/notifications.js";
import { timerSettingsRouter } from "./routes/timer-settings.js";
import { focusSessionsRouter } from "./routes/focus-sessions.js";
import { statsRouter } from "./routes/stats.js";
import { requireAuth } from "./middleware/auth.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin, credentials: false }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/me", requireAuth, meRouter);
  app.use("/tasks", requireAuth, tasksRouter);
  app.use("/projects", requireAuth, projectsRouter);
  app.use("/reminders", requireAuth, remindersRouter);
  app.use("/notifications", requireAuth, notificationsRouter);
  app.use("/timer-settings", requireAuth, timerSettingsRouter);
  app.use("/focus-sessions", requireAuth, focusSessionsRouter);
  app.use("/stats", requireAuth, statsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (err instanceof ZodError) {
      const first = err.errors[0];
      const msg = first?.message ?? "Dados inválidos";
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: "Server error" });
  });

  return app;
}
