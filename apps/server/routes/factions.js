import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/factions
 * @param {PrismaClient} prisma
 */
export default function factionsRouter(prisma) {
  // POST /api/factions/new
  router.post("/new", async (req, res) => {
    if (!res.body) return res.sendStatus(400);
    res.send("This is the root of /api/factions");
  });

  return router;
}
