import { CalendarEvent } from '../dtos/calendarEvent';

export const createDummyEvents = (today: Date): CalendarEvent[] => {
  // Helper to create an event
  const createEvent = (dayOffset: number, hours: number, minutes: number, duration: number, title: string, type: CalendarEvent['type'] = 'other', visibility: CalendarEvent['visibility'] = { type: 'private' }) => {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(date.getHours() + duration);
    const dateUTC = {
      ...toUTCStrings(date),
      end: toUTCStrings(endTime)
    };
    return {
      date: dateUTC.date,
      time: dateUTC.time,
      endDate: dateUTC.end.date,
      endTime: dateUTC.end.time,
      isMultiDay: false,
      title,
      description: `Details for ${title}`,
      type,
      visibility
    };
  };

  // Create a variety of events throughout the month
  return [
    // Private events
    createEvent(0, 9, 0, 1, 'Team Meeting', 'agency_meeting'),
    createEvent(0, 14, 30, 2, 'Client Call', 'booked_out'),
    createEvent(1, 11, 0, 3, 'Workshop', 'class_workshop'),
    createEvent(2, 15, 0, 2, 'Product Review', 'other'),
    createEvent(3, 10, 0, 4, 'Conference', 'booked_out'),
    
    // Events shared with specific agents
    createEvent(4, 13, 0, 1, 'Lunch Meeting', 'agency_meeting', {
      type: 'selected_agents',
      agentIds: ['agent1', 'agent2']
    }),
    createEvent(7, 9, 30, 5, 'Training Session', 'class_workshop', {
      type: 'selected_agents',
      agentIds: ['agent2', 'agent3']
    }),
    createEvent(8, 16, 0, 2, 'Project Planning', 'other', {
      type: 'selected_agents',
      agentIds: ['agent1', 'agent3']
    }),
    createEvent(10, 8, 0, 3, 'Design Review', 'other', {
      type: 'selected_agents',
      agentIds: ['agent1', 'agent2', 'agent3']
    }),
    
    // More private events
    createEvent(-2, 11, 30, 1, 'Last Month Event', 'other'),
    createEvent(15, 14, 0, 2, 'Team Building', 'other'),
    createEvent(16, 10, 0, 4, 'Strategy Meeting', 'agency_meeting'),
    createEvent(20, 15, 30, 2, 'Client Presentation', 'booked_out'),
    createEvent(22, 9, 0, 6, 'All-day Workshop', 'class_workshop'),
    createEvent(25, 13, 30, 1, 'Quick Sync', 'other'),
    createEvent(28, 11, 0, 2, 'Monthly Review', 'other'),
    createEvent(32, 10, 0, 3, 'Next Month Planning', 'other')
  ];
};

// Helper function to convert local date to UTC strings
const toUTCStrings = (localDate: Date): { date: string; time: string } => {
  const utcDate = localDate.toISOString();
  return {
    date: utcDate.split('T')[0],
    time: utcDate.split('T')[1].substring(0, 5)
  };
}; 