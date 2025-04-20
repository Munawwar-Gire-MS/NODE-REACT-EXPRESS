import { Router } from 'express';
import * as TodosService from '../services/todos.service.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = Router();

// Get all todos for the current user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const todos = await TodosService.getTodosByUserId(userId);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

// Create a new todo
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { text, dueDate, status } = req.body;
    
    // Basic validation
    if (!text) {
      return res.status(400).json({ message: 'Todo text is required' });
    }
    
    // Parse the ISO date string exactly as provided by the client
    // This preserves the exact date the user selected
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date();
    
    const newTodo = await TodosService.createTodo({
      userId: new ObjectId(userId),
      text,
      dueDate: parsedDueDate,
      status: status || 'todo'
    });
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Failed to create todo' });
  }
});

// Update a todo
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const todoId = req.params.id;
    const { text, dueDate, status } = req.body;
    
    // Prepare updates
    const updates: Record<string, unknown> = {};
    if (text !== undefined) updates.text = text;
    if (dueDate !== undefined) {
      // Create an exact Date object from the ISO string
      // Preserves the exact date as selected by the user
      updates.dueDate = new Date(dueDate);
    }
    if (status !== undefined) updates.status = status;
    
    const updated = await TodosService.updateTodo(todoId, updates);
    
    if (updated) {
      res.json({ message: 'Todo updated successfully' });
    } else {
      res.status(404).json({ message: 'Todo not found or not updated' });
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

// Delete a todo
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const todoId = req.params.id;
    const deleted = await TodosService.deleteTodo(todoId);
    
    if (deleted) {
      res.json({ message: 'Todo deleted successfully' });
    } else {
      res.status(404).json({ message: 'Todo not found or not deleted' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

export default router; 