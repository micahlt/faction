import jwt from "jsonwebtoken";

export default function expressJWT(req, res, next) {
  if (req.path && req.path.startsWith("/api/auth")) {
    return next();
  }
  const authHeader = req.headers["authorization"];
  const authCookie = req.cookies["auth_token"];
  let token;
  if (authHeader) token = authHeader.split(" ")[1];
  if (authCookie) token = authCookie;

  if (!token) {
    if (req.path && req.method == "GET" && req.path.startsWith("/invite")) {
      return res.redirect(`/login?redirect=${encodeURIComponent(req.path)}`);
    }
    return res.status(401).json({ message: "JWT missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired JWT" });
    }

    req.user = decoded;
    next();
  });
}
