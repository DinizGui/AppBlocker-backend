import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const createSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  frequency: z.enum(["once", "daily", "weekly"]),
  enabled: z.boolean().optional()
});

const updateSchema = createSchema.partial();

function mapFrequency(value: string) {
  switch (value) {
    case "once":
      return "ONCE" as const;
    case "daily":
      return "DAILY" as const;
    default:
      return "WEEKLY" as const;
  }
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ reminders });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = createSchema.parse(req.body);

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        time: data.time,
        frequency: mapFrequency(data.frequency),
        enabled: data.enabled ?? true
      }
    });

    res.status(201).json({ reminder });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = updateSchema.parse(req.body);

    const reminder = await prisma.reminder.updateMany({
      where: { id: req.params.id, userId },
      data: {
        time: data.time,
        frequency: data.frequency ? mapFrequency(data.frequency) : undefined,
        enabled: data.enabled
      }
    });

    if (reminder.count === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    const updated = await prisma.reminder.findFirst({ where: { id: req.params.id, userId } });
    res.json({ reminder: updated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const deleted = await prisma.reminder.deleteMany({
      where: { id: req.params.id, userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.json({ ok: true });
  })
);

export { router as remindersRouter };
