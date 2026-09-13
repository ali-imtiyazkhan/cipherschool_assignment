let prismaInstance: any = null;

try {
  const dbModule = await import("@repo/db");
  prismaInstance = dbModule.prisma || dbModule.default;
} catch (e) {
  try {
    const { PrismaClient } = await import("@prisma/client");
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (err) {
    // Prisma client not yet generated or DB unavailable - fallback will be used
  }
}

export const prisma = prismaInstance;
export default prisma;