import authRouter from "./auth.js";
import factionsRouter from "./factions.js";
import topicsRouter from "./topics.js";
import usersRouter from "./users.js";
import express from "express";
const router = express.Router();

/**
 * Router for /api/indexes
 * @param {PrismaClient} prisma
 */
//export { authRouter, factionsRouter, topicsRouter, usersRouter };
export default function indexesRouter(prisma) {
    // GET /api/indexes/:id
    router.get("/:id", async (req, res) => {
        if(!req.params.id) return res.sendStatus(400);
        const index = await prisma.index.findUnique({
            where: {
                id: req.params.id,
            },
        });
        if (index) {
            res.status(200).send(index);
        }else{
            return res.sendStatus(404);
        }
    });

    //POST /api/indexes/new
    router.post("/new", async (req, res) => {
        if(!req.body || !req.body.name || !req.body.topicID) return res.sendStatus(400);
        //TODO this part should load the messages 
    })

}
