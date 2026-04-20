import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";
import { doesUserAdministrateFaction, isUserInFaction } from "../utils/access.js";

/**
 * Router for /api/topics
 * @param {PrismaClient} prisma
 */
export default function topicsRouter(prisma) {
  // GET /api/topics/:id
  router.get("/:id", async (req, res) => {
    if (!req.params.id) return res.sendStatus(400);
    if (!(await isUserInFaction(req.user.userId, req.params.id, prisma)))
      return res.sendStatus(401);
    const faction = await prisma.topic.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (faction) {
      res.status(200).send(faction);
    } else {
      return res.sendStatus(404);
    }
  });

  // POST /api/topics/new
  router.post("/new", async (req, res) => {
    if (!req.body || !req.body.name || !req.body.factionId) return res.sendStatus(400);
    if (!(await isUserInFaction(req.user.userId, req.body.factionId, prisma)))
      return res.sendStatus(401);
    const { name, factionId } = req.body;
    if (await doesUserAdministrateFaction(req.user.userId, req.body.factionId, prisma)) {
      const createdTopic = await prisma.$transaction(async (tx) => {
        const agg = await tx.topic.aggregate({
          where: {
            factionId: factionId,
          },
          _count: true,
        });

        return await tx.topic.create({
          data: {
            name: name,
            order: agg._count + 1,
            factionId: factionId,
          },
        });
      });
      if (!!createdTopic) {
        res.status(201).send(createdTopic);
      } else {
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(401);
    }
  });

  // PUT /api/topics/:id
  router.put("/:id", async (req, res) => {
    if (!req.body || !req.params.id || !req.body.name) return res.sendStatus(400);
    const topic = await prisma.topic.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        faction: true,
      },
    });
    if (!topic) return res.sendStatus(404);
    if (topic.faction.ownerId === req.user.userId) {
      const updated = await prisma.topic.update({
        where: {
          id: req.params.id,
        },
        data: {
          name: req.body.name,
        },
      });
      if (updated) {
        return res.send(updated);
      } else {
        return res.sendStatus(500);
      }
    } else {
      res.sendStatus(401);
    }
  });

  // DELETE /api/topics/:id
  router.delete("/:id", async (req, res) => {
    if (!req.body || !req.params.id) return res.sendStatus(400);
    const topic = await prisma.topic.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        faction: true,
      },
    });
    if (!topic) return res.sendStatus(404);
    if (topic.faction.ownerId === req.user.userId) {
      const deletion = await prisma.topic.delete({
        where: {
          id: req.params.id,
        },
      });
      if (deletion) {
        return res.sendStatus(200);
      } else {
        return res.sendStatus(500);
      }
    } else {
      res.sendStatus(401);
    }
  });

  return router;
}
