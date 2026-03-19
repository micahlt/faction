import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db";
import registerSocketHandlers from "./src/sockets";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" } // In prod, change to host domain
});

connectDB();

// Middlewares go here
app.use(express.json());

// Register REST endpoints here
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/messages', require('./src/routes/messages'));

registerSocketHandlers(io);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Faction Server is running on http://localhost:${PORT}`);
});