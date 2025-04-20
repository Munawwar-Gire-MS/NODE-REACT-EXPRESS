import { Router, Response, Request, NextFunction } from 'express';
import { WhitelistedEmailsService } from '../services/whitelisted-emails.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const adminRouter = Router();

// Hardcoded admin emails - in production, this should be in a secure configuration
const ADMIN_EMAILS = ['david@talentflowhq.com', 'kellygrace@talentflowhq.com'];

// Middleware to check if user is an admin
const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !ADMIN_EMAILS.includes(req.user.username)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  next();
};

// Add email to whitelist
adminRouter.post('/whitelist', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, userType } = req.body;
    
    if (!email || !userType) {
      return res.status(400).json({ error: 'Email and userType are required' });
    }
    
    if (userType !== 'agent' && userType !== 'client') {
      return res.status(400).json({ error: 'Invalid userType' });
    }
    
    const whitelistedEmail = await WhitelistedEmailsService.createWhitelistedEmail(email, userType);
    
    res.json({
      message: 'Email whitelisted successfully',
      registrationCode: whitelistedEmail.registrationCode
    });
  } catch (error) {
    console.error('Error whitelisting email:', error);
    res.status(500).json({ error: 'Failed to whitelist email' });
  }
}); 