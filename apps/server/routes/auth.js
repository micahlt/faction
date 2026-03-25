import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";

const USERNAME_REGEX = /[a-zA-Z][a-zA-Z0-9-_]{3,32}/gi;
const EMAIL_REGEX =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

const router = express.Router();

/**
 * Router for /api/auth
 * @param {PrismaClient} prisma
 */
export default function authRouter(prisma) {
  router.get("/", async (req, res) => {
    res.send("This is the root of /api/auth");
  });

  // POST /api/auth/checkusername
  router.post("/checkusername", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).send({ error: "Must supply a username." });
    }
    if (username.match(USERNAME_REGEX).length != 1) {
      return res.status(400).send({
        error:
          "Must start with an alphabetic character. Can contain only alphanumeric chars, dashes, and underscores.",
      });
    }
    const existingUser = await prisma.user.findFirst({ where: { username: { equals: username } } });
    if (existingUser != null) {
      return res.status(409).send({ error: "A user with the same username already exists." });
    } else {
      return res.sendStatus(200);
    }
  });

  // PUT /api/auth/signup
  router.put("/signup", async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).send({ error: "Must supply a username, password, and email." });
    }
    console.log(username.match(USERNAME_REGEX));
    if (username.match(USERNAME_REGEX).length != 1) {
      return res.status(400).send({
        error:
          "Username must start with an alphabetic character. Can contain only alphanumeric chars, dashes, and underscores.",
      });
    }
    if (email.match(EMAIL_REGEX).length != 1) {
      return res.status(400).send({
        error: "Must provide a valid email",
      });
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: { equals: username } }, { email: { equals: email } }],
      },
    });
    if (existingUser != null) {
      return res
        .status(409)
        .send({ error: "A user with the same username or email already exists." });
    } else {
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: await bcrypt.hash(password, 10),
        },
      });
      if (newUser != null) {
        return res.status(200).send({ success: "User has been created." });
      } else {
        return res.sendStatus(500);
      }
    }
  });

  return router;
}
