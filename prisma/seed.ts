import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "jeferson@gmail.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Jeferson",
      handle: "@jeferson",
      email,
      passwordHash,
      plan: "Premium (Annual)",
      notificationsEnabled: true,
      dailyGoalMinutes: 240,
      language: "pt-BR",
      timerSettings: { create: {} },
      projects: {
        createMany: {
          data: [
            { name: "Trabalho" },
            { name: "Estudos" },
            { name: "Pessoal" },
            { name: "Outro" }
          ]
        }
      },
      tasks: {
        createMany: {
          data: [
            {
              title: "Design de Interface do Usuario (UI)",
              icon: "color-palette-outline",
              targetSessions: 8,
              completedSessions: 0,
              targetMinutes: 200,
              completedMinutes: 0,
              status: "ACTIVE"
            },
            {
              title: "Pesquisa e Analise de Mercado",
              icon: "search-outline",
              targetSessions: 5,
              completedSessions: 1,
              targetMinutes: 125,
              completedMinutes: 25,
              status: "ACTIVE"
            },
            {
              title: "Escrever Relatorio e Proposta",
              icon: "pencil-outline",
              targetSessions: 6,
              completedSessions: 4,
              targetMinutes: 150,
              completedMinutes: 100,
              status: "ACTIVE"
            }
          ]
        }
      },
      notifications: {
        createMany: {
          data: [
            {
              title: "Sessao concluida",
              message: "Parabens! Voce completou 25 min de foco.",
              icon: "checkmark-circle-outline",
              read: false
            },
            {
              title: "Lembrete de pausa",
              message: "Esta na hora de uma pausa curta. Descanse 5 min.",
              icon: "cafe-outline",
              read: false
            }
          ]
        }
      },
      reminders: {
        createMany: {
          data: [
            { time: "09:00", frequency: "DAILY", enabled: true },
            { time: "18:00", frequency: "DAILY", enabled: true }
          ]
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
