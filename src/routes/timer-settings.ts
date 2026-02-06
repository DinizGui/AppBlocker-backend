import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const updateSchema = z.object({
  focusDurationMinutes: z.coerce.number().int().min(1).optional(),
  shortBreakMinutes: z.coerce.number().int().min(1).optional(),
  longBreakMinutes: z.coerce.number().int().min(1).optional(),
  strictMode: z.boolean().optional(),
  doNotDisturb: z.boolean().optional(),
  alwaysOnDisplay: z.boolean().optional(),
  autoBreaks: z.boolean().optional(),
  repeatCycles: z.boolean().optional(),
  speed2x: z.boolean().optional()
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    let settings = await prisma.timerSettings.findUnique({ where: { userId } });

    if (!settings) {
      settings = await prisma.timerSettings.create({ data: { userId } });
    }

    res.json({ settings });
  })
);

router.put(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = updateSchema.parse(req.body);

    const settings = await prisma.timerSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });

    res.json({ settings });
  })
);

export { router as timerSettingsRouter };
