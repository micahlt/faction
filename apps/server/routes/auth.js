import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/auth
 * @param {PrismaClient} prisma
 */
export default function authRouter(prisma) {
    router.get("/", async (req, res) => {
        res.send("This is the root of /api/auth");
    })

    return router;
}