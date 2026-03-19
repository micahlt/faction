import express from "express";
const router = express.Router();
import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Router for /api/topics
 * @param {PrismaClient} prisma
 */
export default function topicsRouter(prisma) {
    router.get("/", async (req, res) => {
        res.send("This is the root of /api/topics");
    })

    return router;
}