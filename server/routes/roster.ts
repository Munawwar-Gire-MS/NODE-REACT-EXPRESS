import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { RepresentationService } from '../services/representation.service.js';
import { Representation } from '../../shared/schema.js';

const router = Router();

// GET /api/roster - Fetch agent's roster
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const agentId = req.user?.userId;
    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized - User ID not found' });
    }
    
    if (!ObjectId.isValid(agentId)) {
      return res.status(400).json({ error: 'Invalid agent ID format' });
    }
    
    // Assuming RepresentationService.getAgentRoster exists and works as intended
    const roster = await RepresentationService.getAgentRoster(new ObjectId(agentId), true);
    res.json(roster);
  } catch (error) {
    console.error('Error fetching roster:', error);
    const message = error instanceof Error ? error.message : 'Unknown server error';
    res.status(500).json({ error: `Failed to fetch roster: ${message}` });
  }
});

// PUT /api/roster/:representationId - Update representation
router.put('/:representationId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const agentId = req.user?.userId;
    const representationId = req.params.representationId;
    const updates: Partial<Omit<Representation, '_id' | 'agentId' | 'clientId' | 'createdAt'>> = req.body;

    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Basic validation for representationId
    if (!ObjectId.isValid(representationId)) {
      return res.status(400).json({ error: 'Invalid representation ID format' });
    }

    const repId = new ObjectId(representationId);

    // TODO: Add validation to ensure the agent owns this representation before updating
    // const currentRep = await RepresentationService.getRepresentationById(repId);
    // if (!currentRep || !currentRep.agentId.equals(agentId)) {
    //   return res.status(403).json({ error: 'Forbidden: You do not own this representation' });
    // }

    // Assuming RepresentationService.updateRepresentation exists and works
    const updatedRepresentation = await RepresentationService.updateRepresentation(
      repId,
      updates,
      new ObjectId(agentId)
    );

    res.json(updatedRepresentation);
  } catch (error) {
    console.error('Error updating representation:', error);
    // Use unknown type and type check for error message
    const message = (error instanceof Error) ? error.message : 'Failed to update representation';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/roster/:representationId - Archive representation
router.delete('/:representationId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const agentId = req.user?.userId;
    const representationId = req.params.representationId;

    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!ObjectId.isValid(representationId)) {
      return res.status(400).json({ error: 'Invalid representation ID format' });
    }

    const repId = new ObjectId(representationId);

    // TODO: Add validation to ensure the agent owns this representation before archiving
    // const currentRep = await RepresentationService.getRepresentationById(repId);
    // if (!currentRep || !currentRep.agentId.equals(agentId)) {
    //   return res.status(403).json({ error: 'Forbidden: You do not own this representation' });
    // }

    // Assuming RepresentationService.archiveRepresentation exists and works
    await RepresentationService.archiveRepresentation(repId, new ObjectId(agentId));

    res.status(204).send(); // No content on successful deletion/archiving

  } catch (error) {
    console.error('Error archiving representation:', error);
    // Use unknown type and type check for error message
    const message = (error instanceof Error) ? error.message : 'Failed to archive representation';
    res.status(500).json({ error: message });
  }
});

export default router; 