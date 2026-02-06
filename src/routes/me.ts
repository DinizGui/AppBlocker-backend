import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  handle: z.string().min(2).optional(),
  email: z.string().email().optional(),
  plan: z.string().min(1).optional(),
  notificationsEnabled: z.boolean().optional(),
  dailyGoalMinutes: z.coerce.number().int().min(0).optional(),
  language: z.string().min(2).optional()
});

const userSelect = {
  id: true,
  name: true,
  handle: true,
  email: true,
  plan: true,
  notificationsEnabled: true,
  dailyGoalMinutes: true,
  language: true,
  createdAt: true,
  updatedAt: true
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    res.json({ user });
  })
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect
    });

    res.json({ user });
  })
);

export { router as meRouter };
