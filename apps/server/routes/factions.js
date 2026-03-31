import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/factions
 * @param {PrismaClient} prisma
 */
export default function factionsRouter(prisma) {
  // GET /api/factions/:id
  router.get("/:id", async (req, res) => {
    if (!req.params.id) return res.sendStatus(400);
    const faction = await prisma.faction.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        members: !!req.query.members,
        topics: !!req.query.topics,
      },
    });
    if (faction) {
      return res.status(200).send(faction);
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
    const originalFaction = await prisma.faction.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (originalFaction.ownerId === req.user.userId) {
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
        return res.status(200).send(faction);
      } else {
        return res.sendStatus(500);
      }
    } else {
      req.sendStatus(401);
    }
  });

  return router;
}
