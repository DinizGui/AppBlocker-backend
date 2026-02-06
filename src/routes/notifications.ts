import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  icon: z.string().optional()
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ notifications });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = createSchema.parse(req.body);

    const notification = await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        icon: data.icon
      }
    });

    res.status(201).json({ notification });
  })
);

router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const updated = await prisma.notification.updateMany({
      where: { id: req.params.id, userId },
      data: { read: true }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId } });
    res.json({ notification });
  })
);

router.post(
  "/read-all",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({ ok: true });
  })
);

export { router as notificationsRouter };
