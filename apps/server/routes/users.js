import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/factions
 * @param {PrismaClient} prisma
 */
export default function usersRouter(prisma) {
  // POST /api/users/me
  router.get("/me", async (req, res) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: {
        factions: true,
      },
    });
    if (dbUser == null) {
      return res.status(401).send({ error: "User not found." });
    }
    return res.status(200).send({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      imageUrl: dbUser.imageUrl,
      nickname: dbUser.nickname,
      factions: dbUser.factions,
    });
  });

  return router;
}
