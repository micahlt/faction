import { parse } from "cookie";
import jwt from "jsonwebtoken";

/**
 *
 * @param {*} socket
 * @param {*} next
 * @param {import("../generated/prisma/client").PrismaClient} prismaInstance
 * @returns
 */
export default function socketJWT(socket, next, prismaInstance) {
  const cookie = parse(socket.handshake?.headers?.cookie);
  if (!cookie) {
    return next(new Error("Unauthorized"));
  }
  const token = cookie.auth_token;

  if (!token) {
    return next(new Error("JWT missing"));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error("Invalid or expired JWT"));
    }

    if (prismaInstance) {
      const user = await prismaInstance.user.findUnique({
        where: {
          id: decoded.userId,
        },
        include: {
          factions: true,
        },
      });
      if (user) {
        socket.data.user = user;
        delete socket.data.user.password;
      } else {
        return next(new Error("Failed to get user from DB"));
      }
    }

    next();
  });
}
