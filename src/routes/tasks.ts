import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  icon: z.string().min(1).optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  targetSessions: z.coerce.number().int().positive().optional(),
  targetMinutes: z.coerce.number().int().positive().optional(),
  projectId: z.string().optional()
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(["ACTIVE", "COMPLETED"]).optional(),
  completedSessions: z.coerce.number().int().min(0).optional(),
  completedMinutes: z.coerce.number().int().min(0).optional()
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
    const status = statusRaw ? statusRaw.toUpperCase() : undefined;

    const where: any = { userId };
    if (status === "ACTIVE" || status === "COMPLETED") {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { updatedAt: "desc" }
    });

    res.json({ tasks });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = createSchema.parse(req.body);

    const targetMinutes = data.targetMinutes ?? data.durationMinutes ?? 25;
    const targetSessions = data.targetSessions ?? 1;

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        icon: data.icon,
        durationMinutes: data.durationMinutes ?? targetMinutes,
        targetMinutes,
        targetSessions,
        completedMinutes: 0,
        completedSessions: 0,
        status: "ACTIVE",
        projectId: data.projectId
      }
    });

    res.status(201).json({ task });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ task });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = updateSchema.parse(req.body);

    const task = await prisma.task.updateMany({
      where: { id: req.params.id, userId },
      data
    });

    if (task.count === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
    res.json({ task: updated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const deleted = await prisma.task.deleteMany({
      where: { id: req.params.id, userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ ok: true });
  })
);

export { router as tasksRouter };
