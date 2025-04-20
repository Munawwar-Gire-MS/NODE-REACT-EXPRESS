export interface CalendarEvent {
  _id?: string;
  date: string;  // UTC date string
  time: string;  // UTC time string
  endDate: string;  // UTC date string
  endTime: string;  // UTC time string
  isMultiDay: boolean;
  title: string;
  description: string;
  type: 'booked_out' | 'on_set' | 'episode_airing' | 'premiere' | 'callback' | 'audition' | 'class_workshop' | 'agency_meeting' | 'availability_hold' | 'pinned' | 'deadline' | 'other';
  visibility: {
    type: 'private' | 'selected_agents';
    agentIds?: string[];
  };
  agents?: string[];
} 