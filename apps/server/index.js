import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

import expressJWT from "./middleware/expressJWT.js";
import { authRouter, factionsRouter, topicsRouter, usersRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import socketJWT from "./middleware/socketJWT.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGINS, credentials: true },
});

io.use(async (socket, next) => {
  return socketJWT(socket, next, prisma);
});

// Express middlewares go here
app.use(express.json());
app.use(cookieParser());
app.use(expressJWT);

// Register REST endpoints here
app.use("/api/auth", authRouter(prisma));
app.use("/api/factions", factionsRouter(prisma));
app.use("/api/topics", topicsRouter(prisma));
app.use("/api/users", usersRouter(prisma));

io.on("connection", (socket) => {
  console.log(`Socket ID ${socket.id} connected`);

  socket.on("faction:join", async (factionId) => {
    if (socket.data.user.factions.findIndex((f) => f.id === factionId) != -1) {
      socket.join(`f:${factionId}`);
      console.log("Joined room", `f:${factionId}`);
    }
  });

  socket.on("message:send", async (message) => {
    console.log("Sending: " + message.content);
    const msgToSend = {
      id: "fsfdls256df-lasdfkl-j435",
      content: message.content,
      createdAt: new Date(),
      authorId: "asf39q205-5235fasa-j433592d",
      topicId: message.topicId,
      author: {
        imageUrl: "https://google.com/logo.svg",
        nickname: "Micah Lindley",
      },
    };
    io.to(`f:${message.factionId}`).emit("message:recieve", msgToSend);
  });
});

io.on("disconnect", (socket) => {
  console.log(`Socket ID ${socket.id} disconnected.`);
});

const PORT = process.env.HOST_PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Faction Server is running on http://localhost:${PORT}`);
});
