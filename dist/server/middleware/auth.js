import { verifySessionToken } from '../utils/session.js';
export function requireAuth(req, res, next) {
    const token = req.cookies.session;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const payload = verifySessionToken(token);
    if (!payload) {
        res.clearCookie('session');
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = payload;
    next();
}
// Optional: Role-based middleware
export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        next();
    };
}
