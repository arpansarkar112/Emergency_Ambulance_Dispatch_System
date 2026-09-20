import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
    connectionString
} as any); // Type assertion in case of missing types

const prisma = new PrismaClient({
    adapter
});

export { prisma };
