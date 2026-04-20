import { PrismaClient } from "../generated/prisma/client.js";

/**
 * Checks if a user has administrative privliges to a faction
 * @param {string} userId
 * @param {string} factionId
 * @param {PrismaClient} prisma Prisma database instance
 * @returns {bool}
 */
async function doesUserAdministrateFaction(userId, factionId, prisma) {
  const faction = await prisma.faction.findUnique({
    where: {
      id: factionId,
      ownerId: userId,
    },
  });

  return Boolean(faction);
}

/**
 * Checks if a user is a member of a faction
 * @param {string} userId
 * @param {string} factionId
 * @param {PrismaClient} prisma Prisma database instance
 * @returns {bool}
 */
async function isUserInFaction(userId, factionId, prisma) {
  const faction = await prisma.faction.findUnique({
    where: {
      id: factionId,
    },
    select: {
      members: {
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return Boolean(faction && faction.members.length > 0);
}

export { doesUserAdministrateFaction, isUserInFaction };
