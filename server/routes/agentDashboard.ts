import { Router, Response } from 'express';
import { getTodosByUserId } from '../services/todos.service.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { Todo } from '../../shared/schema.js';

export const agentDashboardRouter = Router();

// This will handle /api/agent-dashboard
agentDashboardRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Get todos for this user
    let todos: Todo[] = [];
    // console.log('load todos for userId: ', userId);
    if (userId) {
      todos = await getTodosByUserId(userId);
    }
    
    const data = {
      auditions: Math.floor(Math.random() * 100) + 1,
      scheduleUpdates: Math.floor(Math.random() * 100) + 1,
      priorityReplies: Math.floor(Math.random() * 100) + 1,
      pendingOffers: Math.floor(Math.random() * 100) + 1,
      todos
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}); 