import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1)
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" }
    });

    res.json({ projects });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const data = createSchema.parse(req.body);

    const project = await prisma.project.create({
      data: { userId, name: data.name }
    });

    res.status(201).json({ project });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const deleted = await prisma.project.deleteMany({
      where: { id: req.params.id, userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ ok: true });
  })
);

export { router as projectsRouter };
