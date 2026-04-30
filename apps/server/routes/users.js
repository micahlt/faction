import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";

const PASSWORD_REGEX = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/g;

/**
 * Router for /api/users
 * @param {PrismaClient} prisma
 */
export default function usersRouter(prisma) {
  // GET /api/users/me
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

  // PATCH /api/users/me
  router.patch("/me", async (req, res) => {
    const { imageUrl } = req.body;

    if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
      return res.status(400).send({ error: "Invalid image URL." });
    }

    const dbUser = await prisma.user.update({
      where: { id: req.user?.userId },
      data: { imageUrl },
      include: {
        factions: true,
      },
    });

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
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).send({ error: "Current password is required to change password" });
        }
        const passwordMatched = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatched) {
          return res.status(400).send({ error: "Incorrect Password" });
        }
        //password format validation
        if (!newPassword.match(PASSWORD_REGEX)) {
          return res.status(400).send({
            error:
              "You must use a password that is 8 to 64 characters long and contains a mix of upper and lower case characters, one number and one special character.",
          });
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
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to update user" });
    }
  });

  return router;
}
