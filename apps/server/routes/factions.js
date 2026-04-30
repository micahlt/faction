import express from "express";
import { Server } from "socket.io";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";
import { doesUserAdministrateFaction, isUserInFaction } from "../utils/access.js";
import randomString from "../utils/randomString.js";
import generateJoinMessage from "../utils/generateJoinMessage.js";

/**
 * Router for /api/factions
 * @param {PrismaClient} prisma
 * @param {Server} io
 */
export default function factionsRouter(prisma, io) {
  // GET /api/factions/:id
  router.get("/:id", async (req, res) => {
    if (!req.params.id) return res.sendStatus(400);
    const faction = await prisma.faction.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        members: {
          omit: {
            password: true,
            email: true,
          },
        },
        topics: !!req.query.topics,
      },
    });
    if (faction) {
      if (faction.members.findIndex((m) => m.id === req.user.userId) != -1) {
        return res.status(200).send(faction);
      } else {
        res.sendStatus(401);
      }
    } else {
      return res.sendStatus(404);
    }
  });

  // POST /api/factions/new
  router.post("/new", async (req, res) => {
    if (!req.body || !req.body.name) return res.sendStatus(400);
    const createdFaction = await prisma.faction.create({
      data: {
        name: req.body.name,
        ownerId: req.user.userId,
        iconUrl: req.body.iconUrl || null,
        topics: {
          create: {
            name: "general",
            order: 1,
          },
        },
        members: {
          connect: {
            id: req.user.userId,
          },
        },
      },
    });
    if (!!createdFaction) {
      res.status(201).send(createdFaction);
    } else {
      res.sendStatus(500);
    }
  });

  // PUT /api/factions/:id
  router.put("/:id", async (req, res) => {
    if (!req.params.id || !req.body) return res.sendStatus(400);
    if (await doesUserAdministrateFaction(req.user.userId, req.params.id, prisma)) {
      const modifiedFaction = await prisma.faction.update({
        where: {
          id: req.params.id,
        },
        data: {
          iconUrl: req.body.iconUrl,
          name: req.body.name,
        },
      });
      if (modifiedFaction) {
        return res.status(200).send(modifiedFaction);
      } else {
        return res.sendStatus(500);
      }
    } else {
      req.sendStatus(401);
    }
  });

  // GET /api/factions/:id/perms
  router.get("/:id/perms", async (req, res) => {
    if (!req.params.id) return res.sendStatus(400);
    const userInFaction = await isUserInFaction(req.user.userId, req.params.id, prisma);
    if (!userInFaction) {
      return res.status(200).send({
        owner: false,
        member: false,
      });
    }
    const doesAdministrateFaction = await doesUserAdministrateFaction(
      req.user.userId,
      req.params.id,
      prisma
    );

    return res.status(200).send({
      owner: doesAdministrateFaction,
      member: userInFaction,
    });
  });

  // POST /api/factions/:id/invite
  router.post("/:id/invite", async (req, res) => {
    if (!req.params.id || !req.body) return res.sendStatus(400);
    const { expiresAt } = req.body;
    if (await doesUserAdministrateFaction(req.user.userId, req.params.id, prisma)) {
      const createdInvite = await prisma.invite.create({
        data: {
          code: randomString(6),
          authorId: req.user.userId,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          factionId: req.params.id,
        },
      });
      if (createdInvite) {
        return res.status(201).send({ code: createdInvite.code });
      }
    }
  });

  router.get("/invite/:inviteId", async (req, res) => {
    if (!req.params.inviteId) return res.sendStatus(404);
    const foundInvite = await prisma.invite.findUnique({
      where: {
        code: req.params.inviteId,
      },
    });

    if (foundInvite) {
      if (foundInvite.expiresAt >= new Date()) {
        const existingUser = await prisma.faction.findUnique({
          where: {
            id: foundInvite.factionId,
          },
          select: {
            members: {
              where: {
                id: req.user.userId,
              },
            },
          },
        });

        if (existingUser?.members?.length > 0) {
          console.log(existingUser);
          console.log("User already exists in faction");
          return res.redirect(`/app/${foundInvite.factionId}`);
        }

        const factionAddedTo = await prisma.faction.update({
          where: {
            id: foundInvite.factionId,
          },
          data: {
            members: {
              connect: {
                id: req.user.userId,
              },
            },
          },
          include: {
            topics: true,
          },
        });

        if (factionAddedTo) {
          const createdMsg = await prisma.message.create({
            data: {
              content: generateJoinMessage(req.user.username),
              authorId: "faction-bot",
              topicId: factionAddedTo.topics[0].id,
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
              reactions: true,
            },
          });

          io.to(`t:${factionAddedTo.topics[0].id}`).emit("message:recieve", createdMsg);
          return res.redirect(`/app/${factionAddedTo.id}`);
        }
      } else {
        return res.status(410).send({ error: "This invite is expired." });
      }
    } else {
      return res.sendStatus(404);
    }
  });

  return router;
}
