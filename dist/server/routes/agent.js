import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../middleware/auth.js';
import { RepresentationService } from '../services/representation.service.js';
export const agentRouter = Router();
agentRouter.get('/clients', requireAuth, async (req, res) => {
    try {
        const agentId = new ObjectId(req.user?.userId);
        if (!agentId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const clients = await RepresentationService.getConnectedClients(agentId);
        res.json(clients);
    }
    catch (error) {
        console.error('Error fetching connected clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
