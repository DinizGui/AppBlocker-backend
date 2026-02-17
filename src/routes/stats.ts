import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const sessions = await prisma.focusSession.findMany({
      where: { userId, completed: true, endedAt: { not: null } },
      select: { durationSeconds: true, endedAt: true }
    });

    const totalSeconds = sessions.reduce((sum: number, s: { durationSeconds: number; endedAt: Date | null }) => sum + s.durationSeconds, 0);
    const totalFocusMinutes = Math.round(totalSeconds / 60);

    const daySet = new Set<string>();
    for (const s of sessions) {
      if (s.endedAt) daySet.add(toDateKey(s.endedAt));
    }

    const activeDays = daySet.size;

    const todayKey = toDateKey(new Date());
    const sessionsToday = sessions.filter((s: { durationSeconds: number; endedAt: Date | null }) => s.endedAt && toDateKey(s.endedAt) === todayKey).length;

    res.json({
      totalFocusMinutes,
      activeDays,
      sessionsToday
    });
  })
);

export { router as statsRouter };
