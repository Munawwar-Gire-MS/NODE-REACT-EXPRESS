import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';

interface CalendarMonthProps {
  currentDate: Date;
  selectedDate: Date;
  getEventsForDate: (date: Date) => { regularEvents: CalendarEvent[]; multiDayEvents: CalendarEvent[] };
  getEventIcon: (type: CalendarEvent['type']) => React.ReactNode;
  getColor: (type: CalendarEvent['type']) => string;
  formatTimeDisplay: (date: string, time: string, endDate: string, endTime: string) => string;
  formatEventType: (type: CalendarEvent['type']) => string;
  onDayClick: (day: Date) => void;
}

// Define event type priority order
const EVENT_TYPE_PRIORITY: Record<CalendarEvent['type'], number> = {
  'booked_out': 1,
  'on_set': 2,
  'episode_airing': 3,
  'availability_hold': 4,
  'pinned': 5,
  'premiere': 6,
  'callback': 7,
  'audition': 8,
  'class_workshop': 9,
  'agency_meeting': 10,
  'deadline': 11,
  'other': 12
};

export const CalendarMonth = ({
  currentDate,
  getEventsForDate,
  getEventIcon,
  getColor,
  formatTimeDisplay,
  formatEventType,
  onDayClick
}: CalendarMonthProps) => {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(1 - firstDayOfMonth.getDay()); // Start from last month if needed

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End in next month if needed

  for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(new Date(day));
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Helper function to get the highest priority event type for a day
  const getHighestPriorityEventType = (day: Date): CalendarEvent['type'] | null => {
    const { regularEvents, multiDayEvents } = getEventsForDate(day);
    const allEvents = [...regularEvents, ...multiDayEvents];
    
    if (allEvents.length === 0) return null;
    
    // Only consider specific event types for background styling
    const eventsForBg = allEvents.filter(event => [
      'booked_out', 'on_set', 'episode_airing', 'availability_hold', 'pinned'
    ].includes(event.type));
    
    if (eventsForBg.length === 0) return null;
    
    return eventsForBg.reduce((highestPriority, event) => {
      if (!highestPriority || EVENT_TYPE_PRIORITY[event.type] < EVENT_TYPE_PRIORITY[highestPriority]) {
        return event.type;
      }
      return highestPriority;
    }, eventsForBg[0].type);
  };

  // Helper function to get sorted events by priority
  const getSortedEvents = (day: Date): CalendarEvent[] => {
    const { regularEvents, multiDayEvents } = getEventsForDate(day);
    const allEvents = [...regularEvents, ...multiDayEvents];
    
    return allEvents.sort((a, b) => EVENT_TYPE_PRIORITY[a.type] - EVENT_TYPE_PRIORITY[b.type]);
  };

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="bg-white px-2 py-1 text-xs text-gray-500 font-medium">
          {day}
        </div>
      ))}
      {weeks.map((week, weekIndex) => (
        week.map((day, dayIndex) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const highestPriorityType = getHighestPriorityEventType(day);
          const bgColor = highestPriorityType ? getColor(highestPriorityType).split(' ')[0] : '';
          const sortedEvents = getSortedEvents(day);

          return (
            <div
              key={`${weekIndex}-${dayIndex}`}
              onClick={() => onDayClick(day)}
              className={`${
                bgColor ? bgColor : isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } min-h-[100px] p-1 cursor-pointer hover:bg-gray-100 ${
                isToday ? 'bg-purple-50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-white bg-black rounded-full w-6 h-6 flex items-center justify-center' :
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {sortedEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    className={`${getColor(event.type)} px-1 py-0.5 rounded text-xs flex items-center gap-1 min-w-0`}
                    title={`${formatTimeDisplay(event.date, event.time, event.endDate, event.endTime)} - ${event.title} (${formatEventType(event.type)})`}
                  >
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-shrink-0">
                      {formatTimeDisplay(event.date, event.time, event.endDate, event.endTime).split(' - ')[0]}
                    </div>
                    <div className="truncate">
                      {event.title}
                    </div>
                  </div>
                ))}
                {sortedEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{sortedEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })
      ))}
    </div>
  );
}; 