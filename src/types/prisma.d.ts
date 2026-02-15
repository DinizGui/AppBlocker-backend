/** Fallback so tsc can resolve PrismaClient when generated client is missing. Run "prisma generate" before build. */
declare module "@prisma/client" {
  export const PrismaClient: new (options?: { adapter?: unknown }) => any;
}
