import jwt from 'jsonwebtoken';

export default function authenticateJWT(req, res, next) {
    if (req.path.startsWith("/api/auth")) {
        return next();
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'JWT missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired JWT' });
        }

        req.user = decoded;
        next();
    });
}