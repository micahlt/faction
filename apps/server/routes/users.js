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

  //change username/passord
  router.put("/me", async (req, res) => {
    const { nickname, currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    //Only you can change your own info.
    if (!userId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      //use your current password to change your password
      if (newPassord) {
        if (!currentPassword) {
          return res.status(400).send({ error: "Current password is required to change password"});
        }
        const passwordMatched = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatched) {
          return res.status(400).send({ error: "Incorrect Password" });
        }
        //password format validation
        if (!newPassword.match(PASSWORD_REGEX)) {
          return res.status(400).send({ error: "Password does not meet requirements" });
        }
      }

      const updateData = {};
      if (nickname) updateData.nickname = nickname;
      if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          imageUrl: true,
          nickname: true,
        },
      });
      
      return res.status(200).send(updatedUser);
    }catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to update user" });
    }
  });

  return router;
}
