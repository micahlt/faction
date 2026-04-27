import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient({});

export default async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}