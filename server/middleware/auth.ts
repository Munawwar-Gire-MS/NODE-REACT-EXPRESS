import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../utils/session.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'agent' | 'client';
    username: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
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
export function requireRole(role: 'agent' | 'client') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
} 