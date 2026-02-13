import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { createToken } from "../lib/auth.js";
import { asyncHandler } from "../lib/async.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
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

function makeHandle(name: string, email: string) {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  const fallback = email.split("@")[0]?.toLowerCase() || "user";
  return "@" + (base || fallback).slice(0, 20);
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const handle = makeHandle(data.name, email);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        handle,
        email,
        passwordHash,
        plan: "Premium (Annual)",
        notificationsEnabled: true,
        dailyGoalMinutes: 240,
        language: "pt-BR",
        timerSettings: {
          create: {}
        },
        projects: {
          createMany: {
            data: [
              { name: "Trabalho" },
              { name: "Estudos" },
              { name: "Pessoal" },
              { name: "Outro" }
            ]
          }
        }
      },
      select: userSelect
    });

    const token = createToken(user.id);
    res.status(201).json({ token, user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken(user.id);
    const safeUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: userSelect
    });

    res.json({ token, user: safeUser });
  })
);

export { router as authRouter };
