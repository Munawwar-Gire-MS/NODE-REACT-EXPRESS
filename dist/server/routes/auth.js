import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
export const authRouter = Router();
// This will handle /api/auth/login
authRouter.post('/login', async (req, res) => {
    //console.log('Login attempt:', req.body); // Debug log
    try {
        const { username, password } = req.body;
        const { user, token } = await AuthService.authenticateUser(username, password);
        //console.log('user', user);
        //console.log('token', token);
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('Login error:', error); // Debug log
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
// This will handle /api/auth/register
authRouter.post('/register', async (req, res) => {
    //console.log('Register attempt:', req.body); // Debug log
    try {
        const { email, password, registrationCode, name } = req.body;
        if (!email || !password || !registrationCode || !name) {
            return res.status(400).json({ error: 'Email, password, registration code, and name are required' });
        }
        const { user, token } = await AuthService.registerUser(email, password, registrationCode, name);
        //console.log('user', user);
        //console.log('token', token);
        res.cookie('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error); // Debug log
        if (error instanceof Error) {
            if (error.message === 'Email is not whitelisted for registration') {
                return res.status(403).json({ error: 'Your email is not whitelisted for registration' });
            }
            else if (error.message === 'User already exists') {
                return res.status(409).json({ error: 'User already exists' });
            }
            else if (error.message === 'Invalid registration code') {
                return res.status(400).json({ error: 'Invalid registration code' });
            }
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});
authRouter.get('/session', async (req, res) => {
    const authReq = req;
    const token = authReq.cookies.session;
    // If no token and we're on login page (check referrer or query param),
    // return 200 with null user instead of 401
    if (!token) {
        return res.json({ user: null });
    }
    try {
        const user = await AuthService.getUserFromToken(token);
        if (!user) {
            res.clearCookie('session');
            return res.json({ user: null });
        }
        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error('Session check error:', error);
        res.clearCookie('session');
        res.json({ user: null });
    }
});
authRouter.post('/logout', (_req, res) => {
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.json({ success: true });
});
