import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/factions
 * @param {PrismaClient} prisma
 */
export default function factionsRouter(prisma) {
  router.get("/", async (req, res) => {
    res.send("This is the root of /api/factions");
  });

  return router;
}
