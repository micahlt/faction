import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { authRouter, factionsRouter, topicsRouter } from "./routes/index.js"

const adapter = new PrismaBetterSqlite3({ url: "file:./faction.db" });
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

// Middlewares go here
app.use(express.json());

// Register REST endpoints here
app.use('/api/auth', authRouter(prisma));
app.use('/api/factions', factionsRouter(prisma));
app.use('/api/topics', topicsRouter(prisma));

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Faction Server is running on http://localhost:${PORT}`);
});