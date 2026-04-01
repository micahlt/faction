import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client.js";

// Regexes sourced from https://regexr.com
const USERNAME_REGEX = /[a-zA-Z][a-zA-Z0-9-_]{3,32}/gi;
const EMAIL_REGEX =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
const PASSWORD_REGEX = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/g;

const router = express.Router();

/**
 * Router for /api/auth
 * @param {PrismaClient} prisma
 */
export default function authRouter(prisma) {
  // POST /api/auth/checkusername
  router.post("/checkusername", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const { username } = req.body;
    if (!username) {
      return res.status(400).send({ error: "You must supply a username." });
    }
    if (username.match(USERNAME_REGEX).length != 1) {
      return res.status(400).send({
        error:
          "Usernames must start with an alphabetic character. Can contain only alphanumeric chars, dashes, and underscores.",
      });
    }
    const existingUser = await prisma.user.findFirst({ where: { username: { equals: username } } });
    if (existingUser != null) {
      return res.status(409).send({ error: "A user with the same username already exists." });
    } else {
      return res.sendStatus(200);
    }
  });

  // POST /api/auth/signup
  router.post("/signup", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const { username, password, email, nickname } = req.body;
    if (!username || !password || !email) {
      return res.status(400).send({ error: "You must supply a username, password, and email." });
    }
    if (username.match(USERNAME_REGEX)?.length != 1) {
      return res.status(400).send({
        error:
          "Username must start with an alphabetic character. Can contain only alphanumeric chars, dashes, and underscores.",
      });
    }
    if (email.match(EMAIL_REGEX)?.length != 1) {
      return res.status(400).send({
        error: "You must provide a valid email.",
      });
    }
    if (password.match(PASSWORD_REGEX)?.length != 1) {
      return res.status(400).send({
        error:
          "You must use a password that is 8 to 64 characters long and contains a mix of upper and lower case characters, one number and one special character.",
      });
    }
    if (nickname?.length < 1) {
      return res
        .status(400)
        .send({ error: "You must choose a nickname.  You can change this later." });
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
          nickname,
        },
      });
      if (newUser != null) {
        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(201).send({ success: "User has been created." });
      } else {
        return res.sendStatus(500);
      }
    }
  });

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).send({
        error: "You must provide a valid username.",
      });
    }
    if (!password) {
      return res.status(400).send({
        error: "You must provide a valid password.",
      });
    }
    const dbUser = await prisma.user.findUnique({ where: { username: username } });
    if (dbUser == null) {
      return res.status(401).send({
        error: "Incorrect username or password.",
      });
    }
    if (await bcrypt.compare(password, dbUser.password)) {
      const token = jwt.sign({ userId: dbUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.sendStatus(200);
    } else {
      return res.status(401).send({
        error: "Incorrect username or password.",
      });
    }
  });

  // DELETE /api/auth/login
  router.delete("/logout", async (req, res) => {
    return res.clearCookie("auth_token").sendStatus(200);
  });

  return router;
}
