import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const createSchema = z.object({
  taskId: z.string().optional(),
  durationSeconds: z.coerce.number().int().positive(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  strictMode: z.boolean().optional(),
  completed: z.boolean().optional()
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const fromRaw = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
    const toRaw = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

    const timeFilter: { gte?: Date; lte?: Date } = {};
    if (fromRaw) timeFilter.gte = fromRaw;
    if (toRaw) timeFilter.lte = toRaw;

    const where: { userId: string; startedAt?: { gte?: Date; lte?: Date } } = { userId };
    if (Object.keys(timeFilter).length > 0) {
      where.startedAt = timeFilter;
    }

    const focusSessions = await prisma.focusSession.findMany({
      where,
      orderBy: { startedAt: "desc" }
    });

    res.json({ focusSessions });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = createSchema.parse(req.body);

    const completed = data.completed ?? true;
    const startedAt = data.startedAt ? new Date(data.startedAt) : new Date();
    const endedAt = data.endedAt ? new Date(data.endedAt) : completed ? new Date() : null;

    const focusSession = await prisma.focusSession.create({
      data: {
        userId,
        taskId: data.taskId,
        durationSeconds: data.durationSeconds,
        startedAt,
        endedAt,
        strictMode: data.strictMode ?? false,
        completed
      }
    });

    if (completed && data.taskId) {
      const minutes = Math.round(data.durationSeconds / 60);
      await prisma.task.updateMany({
        where: { id: data.taskId, userId },
        data: {
          completedMinutes: { increment: minutes },
          completedSessions: { increment: 1 }
        }
      });
    }

    res.status(201).json({ focusSession });
  })
);

export { router as focusSessionsRouter };
