import { getCalendarCollection } from '../utils/db.js';
import { toDate } from 'date-fns-tz';
export class CalendarService {
    /**
     * Create a new calendar event
     */
    static async createEvent(title, description, date, time, endDate, endTime, timeZone, createdBy, ownerId, visibility, type = 'other', location, isMultiDay = false) {
        const calendarCollection = await getCalendarCollection();
        // Ensure time is in 24-hour format (should already be from client)
        console.log('Raw input:', { date, time, endDate, endTime, timeZone });
        // Convert local date/time to UTC using the timezone
        const localStartStr = `${date}T${time}:00`;
        const localEndStr = `${endDate}T${endTime}:00`;
        const startDateTime = toDate(localStartStr, { timeZone });
        const endDateTime = toDate(localEndStr, { timeZone });
        console.log('Time conversion:', {
            localStart: localStartStr,
            localEnd: localEndStr,
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            timeZone
        });
        const now = new Date();
        const event = {
            title,
            description,
            startDateTime,
            endDateTime,
            isMultiDay,
            location,
            type,
            createdBy,
            ownerId,
            visibility,
            status: 'active',
            createdAt: now,
            updatedAt: now
        };
        const result = await calendarCollection.insertOne(event);
        return { ...event, _id: result.insertedId };
    }
    /**
     * Get an event by ID
     */
    static async getEventById(eventId) {
        const calendarCollection = await getCalendarCollection();
        return calendarCollection.findOne({ _id: eventId, status: 'active' });
    }
    /**
     * Get events for a user's calendar
     */
    static async getEventsForCalendar(userId, ownerId, startDate, endDate, timeZone) {
        const calendarCollection = await getCalendarCollection();
        // Convert local date range to UTC for query
        const startDateTime = toDate(`${startDate}`, { timeZone });
        const endDateTime = toDate(`${endDate}`, { timeZone });
        console.log('Converting query dates to UTC:', {
            local: { startDate, endDate, timeZone },
            utc: { startDateTime, endDateTime }
        });
        // Base query for events owned by the client
        const query = {
            ownerId,
            status: 'active',
            $or: [
                // Regular events that start within the date range
                {
                    $and: [
                        { startDateTime: { $gte: startDateTime } },
                        { startDateTime: { $lte: endDateTime } },
                        { isMultiDay: false }
                    ]
                },
                // Multi-day events that overlap with the date range
                {
                    $and: [
                        { isMultiDay: true },
                        { startDateTime: { $lte: endDateTime } },
                        { endDateTime: { $gte: startDateTime } }
                    ]
                }
            ]
        };
        // If the user is viewing their own calendar (userId === ownerId)
        if (userId.equals(ownerId)) {
            // Get all events where:
            // 1. The user is the owner
            // 2. The event is public
            // 3. The event is private but the user is the creator
            // 4. The event is for selected agents and the user is one of them
            return calendarCollection.find({
                $and: [
                    {
                        $or: [
                            { ownerId: userId },
                            { 'visibility.type': 'public' },
                            {
                                $and: [
                                    { 'visibility.type': 'private' },
                                    { createdBy: userId }
                                ]
                            },
                            {
                                $and: [
                                    { 'visibility.type': 'selected_agents' },
                                    { 'visibility.agentIds': userId }
                                ]
                            }
                        ]
                    },
                    query
                ]
            });
        }
        else {
            // If an agent is viewing a client's calendar, only return events that are:
            // 1. Public events
            // 2. Events where the agent is explicitly selected
            return calendarCollection.find({
                $and: [
                    {
                        $or: [
                            { 'visibility.type': 'public' },
                            {
                                $and: [
                                    { 'visibility.type': 'selected_agents' },
                                    { 'visibility.agentIds': userId }
                                ]
                            }
                        ]
                    },
                    query
                ]
            });
        }
    }
    /**
     * Update an event
     */
    static async updateEvent(eventId, title, description, date, time, endDate, endTime, timeZone, updatedBy, visibility, type = 'other', isMultiDay = false) {
        const calendarCollection = await getCalendarCollection();
        // Convert local date/time to UTC using the timezone
        const localStartStr = `${date}T${time}:00`;
        const localEndStr = `${endDate}T${endTime}:00`;
        const startDateTime = toDate(localStartStr, { timeZone });
        const endDateTime = toDate(localEndStr, { timeZone });
        const now = new Date();
        const update = {
            title,
            description,
            startDateTime,
            endDateTime,
            isMultiDay,
            type,
            visibility,
            updatedAt: now,
            updatedBy
        };
        await calendarCollection.updateOne({ _id: eventId }, update);
        return await calendarCollection.findOne({ _id: eventId });
    }
    /**
     * Soft delete an event by setting its status to 'deleted'
     */
    static async deleteEvent(eventId) {
        const calendarCollection = await getCalendarCollection();
        const result = await calendarCollection.updateOne({ _id: eventId, status: 'active' }, {
            status: 'deleted',
            updatedAt: new Date()
        });
        if (result.matchedCount === 0) {
            throw new Error('Event not found');
        }
    }
    /**
     * Hard delete an event by removing it from the database
     */
    static async hardDeleteEvent(eventId) {
        const calendarCollection = await getCalendarCollection();
        const result = await calendarCollection.deleteOne({ _id: eventId });
        if (result.deletedCount === 0) {
            throw new Error('Event not found');
        }
    }
}
