import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";

/**
 *
 * @param {PrismaClient} prisma
 */
export default async function instantiateBotUser(prisma) {
  const botUser = {
    email: "bot@faction.micahlindley.com",
    password: process.env.BOT_PASSWORD,
    username: "faction",
    nickname: "Faction Bot",
    id: "faction-bot",
    imageUrl: "/faction-logo.png",
  };

  await prisma.user.upsert({
    where: {
      id: "faction-bot",
    },
    create: {
      ...botUser,
    },
    update: {
      ...botUser,
    },
  });
}
