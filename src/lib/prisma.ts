import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

function normalizeDatabaseUrl(raw: string | undefined): string {
  if (!raw || raw === "undefined") return "";
  const firstLine = raw.split("\n")[0].trim();
  let value = firstLine;
  if (value.startsWith("DATABASE_URL=")) {
    value = value.slice("DATABASE_URL=".length).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
  }
  return value.trim();
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (!databaseUrl || !databaseUrl.startsWith("mysql")) {
  throw new Error(
    "DATABASE_URL is not set or invalid. Set DATABASE_URL to a MySQL URL (e.g. mysql://user:pass@host:3306/dbname)."
  );
}
const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});

export const prisma = new PrismaClient({ adapter });
