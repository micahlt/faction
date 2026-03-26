import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

import authenticateJWT from "./middleware/authenticateJWT.js";
import { authRouter, factionsRouter, topicsRouter } from "./routes/index.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGINS },
});

// Middlewares go here
app.use(express.json());
app.use(authenticateJWT);

// Register REST endpoints here
app.use("/api/auth", authRouter(prisma));
app.use("/api/factions", factionsRouter(prisma));
app.use("/api/topics", topicsRouter(prisma));

const PORT = process.env.HOST_PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Faction Server is running on http://localhost:${PORT}`);
});
