import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { CalendarService } from '../services/calendar.service.js';
import { formatDateForClient } from '../utils/date.js';
import { RepresentationService } from '../services/representation.service.js';

export const calendarRouter = Router();

// GET /api/calendar/events - Get events for a date range
calendarRouter.get('/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Calendar events request rejected: No userId found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { startDate, endDate, timeZone, clientId } = req.query;
    console.log('Fetching calendar events:', { userId, startDate, endDate, timeZone, clientId });

    if (!startDate || !endDate || !timeZone || 
        typeof startDate !== 'string' || 
        typeof endDate !== 'string' || 
        typeof timeZone !== 'string') {
      console.warn('Calendar events request rejected: Missing or invalid parameters', { startDate, endDate, timeZone });
      return res.status(400).json({ error: 'Start date, end date, and timezone are required as query parameters' });
    }

    // If clientId is provided, verify the agent represents this client
    if (clientId && typeof clientId === 'string') {
      const representations = await RepresentationService.getRepresentationsByAgentId(new ObjectId(userId));
      const hasRepresentation = representations.some(rep => 
        rep.clientId.equals(new ObjectId(clientId)) && 
        rep.status === 'active'
      );

      if (!hasRepresentation) {
        console.warn('Calendar events request rejected: Agent does not represent this client', { userId, clientId });
        return res.status(403).json({ error: 'You do not represent this client' });
      }
    }

    const events = await CalendarService.getEventsForCalendar(
      new ObjectId(userId),
      typeof clientId === 'string' ? new ObjectId(clientId) : new ObjectId(userId), // Use clientId as ownerId if provided
      startDate,
      endDate,
      timeZone
    );

    // Format dates in user's timezone before sending response
    const formattedEvents = events.map(event => {
      const start = formatDateForClient(event.startDateTime, timeZone);
      const end = formatDateForClient(event.endDateTime, timeZone);
      
      return {
        ...event,
        date: start.date,
        time: start.time,
        endDate: end.date,
        endTime: end.time
      };
    });

    console.log(`Successfully fetched ${events.length} calendar events`);
    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// PUT /api/calendar/events - Create a new event
calendarRouter.put('/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Calendar event creation rejected: No userId found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Received calendar event creation request:', { 
      userId,
      body: { ...req.body, agents: req.body.agents?.length }
    });

    const {
      title,
      description,
      date,
      time,
      endDate,
      endTime,
      visibility,
      timeZone,
      type,
      isMultiDay
    } = req.body;

    console.log('Received calendar event creation request:', { 
      userId,
      body: { ...req.body, agents: req.body.agents?.length }
    });

    if (!title || !date || !time || !endDate || !endTime || !timeZone) {
      console.warn('Calendar event creation rejected: Missing required fields', {
        hasTitle: !!title,
        hasDate: !!date,
        hasTime: !!time,
        hasEndDate: !!endDate,
        hasEndTime: !!endTime,
        hasTimeZone: !!timeZone
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          title: !title ? 'missing' : 'ok',
          date: !date ? 'missing' : 'ok',
          time: !time ? 'missing' : 'ok',
          endDate: !endDate ? 'missing' : 'ok',
          endTime: !endTime ? 'missing' : 'ok',
          timeZone: !timeZone ? 'missing' : 'ok'
        }
      });
    }

    // Create visibility object based on type
    const visibilityObj = {
      type: visibility.type === 'selected_agents' ? 'selected_agents' as const : 'private' as const,
      agentIds: visibility.type === 'selected_agents' ? visibility.agentIds?.map((id: string) => new ObjectId(id)) : undefined
    };

    console.log('Visibility object:', visibilityObj);

    const savedEvent = await CalendarService.createEvent(
      title,
      description || '',
      date,
      time,
      endDate,
      endTime,
      timeZone,
      new ObjectId(userId),
      new ObjectId(userId), // For clients, ownerId is the same as userId
      visibilityObj,
      type || 'other',
      undefined,
      isMultiDay || false
    );

    // Format dates in user's timezone before sending response
    const start = formatDateForClient(savedEvent.startDateTime, timeZone);
    const end = formatDateForClient(savedEvent.endDateTime, timeZone);
    
    const formattedEvent = {
      ...savedEvent,
      date: start.date,
      time: start.time,
      endDate: end.date,
      endTime: end.time
    };

    console.log('Successfully created calendar event:', { 
      eventId: savedEvent._id,
      title: savedEvent.title,
      start: formattedEvent.date + 'T' + formattedEvent.time,
      end: formattedEvent.endDate + 'T' + formattedEvent.endTime
    });

    res.json(formattedEvent);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// PATCH /api/calendar/events/:id - Update an existing event
calendarRouter.patch('/events/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Calendar event update rejected: No userId found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const {
      title,
      description,
      date,
      time,
      endDate,
      endTime,
      visibility,
      timeZone,
      type,
      isMultiDay
    } = req.body;

    if (!title || !date || !time || !endDate || !endTime || !timeZone) {
      console.warn('Calendar event update rejected: Missing required fields', {
        hasTitle: !!title,
        hasDate: !!date,
        hasTime: !!time,
        hasEndDate: !!endDate,
        hasEndTime: !!endTime,
        hasTimeZone: !!timeZone
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          title: !title ? 'missing' : 'ok',
          date: !date ? 'missing' : 'ok',
          time: !time ? 'missing' : 'ok',
          endDate: !endDate ? 'missing' : 'ok',
          endTime: !endTime ? 'missing' : 'ok',
          timeZone: !timeZone ? 'missing' : 'ok'
        }
      });
    }

    // Create visibility object based on type
    const visibilityObj = {
      type: visibility.type === 'selected_agents' ? 'selected_agents' as const : 'private' as const,
      agentIds: visibility.type === 'selected_agents' ? visibility.agentIds?.map((id: string) => new ObjectId(id)) : undefined
    };

    const updatedEvent = await CalendarService.updateEvent(
      new ObjectId(eventId),
      title,
      description || '',
      date,
      time,
      endDate,
      endTime,
      timeZone,
      new ObjectId(userId),
      visibilityObj,
      type || 'other',
      isMultiDay || false
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Format dates in user's timezone before sending response
    const start = formatDateForClient(updatedEvent.startDateTime, timeZone);
    const end = formatDateForClient(updatedEvent.endDateTime, timeZone);
    
    const formattedEvent = {
      ...updatedEvent,
      date: start.date,
      time: start.time,
      endDate: end.date,
      endTime: end.time
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// DELETE /api/calendar/events/:id - Delete an event
calendarRouter.delete('/events/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Calendar event deletion rejected: No userId found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    await CalendarService.hardDeleteEvent(new ObjectId(eventId));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
}); 