import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client.js";

import expressJWT from "./middleware/expressJWT.js";
import {
  authRouter,
  factionsRouter,
  topicsRouter,
  usersRouter,
  assetsRouter,
} from "./routes/index.js";
import cookieParser from "cookie-parser";
import socketJWT from "./middleware/socketJWT.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "faction.db" });
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : "http://localhost:3000";

// Express middlewares go here
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

import cors from "cors";
import { isUserInTopic } from "./utils/access.js";
app.use(cors(corsOptions));

const io = new Server(httpServer, {
  cors: corsOptions,
});

io.use(async (socket, next) => {
  return socketJWT(socket, next, prisma);
});

// Express middlewares go here
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());

// Register REST endpoints here
app.use("/api/auth", authRouter(prisma));
app.use("/api/factions", expressJWT, factionsRouter(prisma));
app.use("/api/topics", expressJWT, topicsRouter(prisma));
app.use("/api/users", expressJWT, usersRouter(prisma));
app.use("/api/assets", expressJWT, assetsRouter(prisma));
app.get("/invite/:inviteId", (req, res) => {
  res.redirect(`/api/factions/invite/${req.params.inviteId}`);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../web/dist")));

  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../web/dist", "index.html"));
  });
}

io.on("connection", (socket) => {
  socket.on("ping:alive", () => {
    // console.log(`User ${socket.data.user.username} sent alive ping`);

    // notifies all factions the user is in that they are online
    socket.data.user.factions.forEach((faction) => {
      io.to(`f:${faction.id}`).emit("user:online", {
        userId: socket.data.user.id,
        username: socket.data.user.username,
      });
    });
  });

  socket.on("faction:join", async (factionId) => {
    if (socket.data.user.factions.findIndex((f) => f.id === factionId) != -1) {
      socket.join(`f:${factionId}`);
      console.log("Joined room", `f:${factionId}`);
      socket.data.user.factions.forEach((faction) => {
        io.to(`f:${faction.id}`).emit("user:online", {
          userId: socket.data.user.id,
          username: socket.data.user.username,
        });
      });
    }
  });

  //load messages for topic
  socket.on("topic:join", async (topicId) => {
    if (isUserInTopic(socket.data.user.id, topicId, prisma)) {
      socket.join(`t:${topicId}`);
      console.log("In topic", `t:${topicId}`);
    }
  });

  socket.on("topic:leave", async (topicId) => {
    socket.leave(`t:${topicId}`);
  });

  socket.on("message:send", async (message) => {
    // console.log("Sending: " + message.content);
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

  socket.on("message:react", async (reaction) => {
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: reaction.messageId,
          userId: socket.data.user.id,
          emoji: reaction.emoji,
        },
      },
    });

    if (existingReaction) {
      await prisma.reaction.delete({
        where: {
          messageId_userId_emoji: {
            messageId: reaction.messageId,
            userId: socket.data.user.id,
            emoji: reaction.emoji,
          },
        },
      });
    } else {
      await prisma.reaction.create({
        data: {
          emoji: reaction.emoji,
          userId: socket.data.user.id,
          messageId: reaction.messageId,
        },
      });
    }

    const allReactions = await prisma.reaction.findMany({
      where: {
        messageId: reaction.messageId,
      },
    });

    io.to(`t:${reaction.topicId}`).emit("message:update_react", {
      messageId: reaction.messageId,
      reactions: allReactions,
    });
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
