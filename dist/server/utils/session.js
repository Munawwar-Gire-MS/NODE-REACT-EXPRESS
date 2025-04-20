import jwt from 'jsonwebtoken';
// These should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';
export function createSessionToken(user) {
    // Only include necessary user data in token
    const payload = {
        userId: user._id,
        role: user.role,
        username: user.username
    };
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}
export function verifySessionToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        console.log('error', error);
        return null;
    }
}
