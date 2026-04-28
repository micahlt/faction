import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

import expressJWT from "./middleware/expressJWT.js";
import { authRouter, factionsRouter, topicsRouter, usersRouter, uploadRouter } from "./routes/index.js";import cookieParser from "cookie-parser";
import socketJWT from "./middleware/socketJWT.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "faction.db" });
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
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());
app.use(expressJWT);

// Register REST endpoints here
app.use("/api/auth", authRouter(prisma));
app.use("/api/factions", factionsRouter(prisma));
app.use("/api/topics", topicsRouter(prisma));
app.use("/api/users", usersRouter(prisma));
app.use("/api/upload", uploadRouter(prisma));

io.on("connection", (socket) => {
  socket.on("ping:alive", () => {
    console.log(`User ${socket.data.user.username} sent alive ping`);
  });

  socket.on("faction:join", async (factionId) => {
    if (socket.data.user.factions.findIndex((f) => f.id === factionId) != -1) {
      socket.join(`f:${factionId}`);
      console.log("Joined room", `f:${factionId}`);
    }
  });

  //load messages for topic
  socket.on("topic:join", async (topicId) => {
    if (socket.data.user.topics.findIndex((t) => t.id === topicId) != -1) {
      socket.join(`t:${topicId}`);
      console.log("In topic", `t:${topicId}`);
    }
  });

  socket.on("message:send", async (message) => {
    console.log("Sending: " + message.content);
    const createdMsg = await prisma.message.create({
      data: {
        content: message.content,
        authorId: socket.data.user.id,
        topicId: message.topicId,
      },
      include: {
        author: {
          select: {
            id: true,
            imageUrl: true,
            nickname: true,
            username: true,
          },
        },
      },
    });

    io.to(`f:${message.factionId}`).emit("message:recieve", createdMsg);
  });
  socket.on("typing:start", ({ factionId, topicId }) => {
    if (!factionId || !topicId) return;

    socket.to(`f:${factionId}`).emit("typing:start", {
      topicId,
      user: {
        id: socket.data.user.id,
        imageUrl: socket.data.user.imageUrl,
        nickname: socket.data.user.nickname,
        username: socket.data.user.username,
      },
    });
  });

  socket.on("typing:stop", ({ factionId, topicId }) => {
    if (!factionId || !topicId) return;

    socket.to(`f:${factionId}`).emit("typing:stop", {
      topicId,
      userId: socket.data.user.id,
    });
  });
});

io.on("disconnect", (socket) => {
  console.log(`Socket ID ${socket.id} disconnected.`);
});

const PORT = process.env.HOST_PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Faction Server is running on http://localhost:${PORT}`);
});
