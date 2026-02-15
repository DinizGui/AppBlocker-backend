import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// prisma generate only needs a URL shape; use dummy if missing (e.g. CI build)
const databaseUrl = process.env.DATABASE_URL || "mysql://localhost:3306/appblocker";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    datasource: "db",
  },
});
