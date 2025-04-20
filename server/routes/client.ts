import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { ClientService } from '../services/client.service.js';
import { requireAuth } from '../middleware/auth.js';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../../shared/schema.js';
import { RepresentationService } from '../services/representation.service.js';

export const clientRouter = Router();

// Get current client profile
clientRouter.get('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = new ObjectId(req.user.userId);
    const client = await ClientService.getClientById(userId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update client profile
clientRouter.put('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'client') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = new ObjectId(req.user.userId);
    const { profile, name } = req.body;
    const updates: Partial<User> = {};

    if (profile) {
      updates.profile = profile;
    }

    if (name && typeof name === 'object') {
      updates.name = {
        first: name.first || '',
        last: name.last || ''
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    // Update client profile
    const updatedClient = await ClientService.updateClient(userId, updates);

    return res.json({
      success: true,
      data: updatedClient
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

clientRouter.get('/agents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const clientId = new ObjectId(req.user?.userId);
    console.log(`[DEBUG] Client ID: ${clientId}`);
    if (!clientId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const agents = await RepresentationService.getConnectedAgents(clientId);
    res.json(agents);
  } catch (error) {
    console.error('Error fetching connected agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 