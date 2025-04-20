import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';

interface CalendarYearProps {
  currentDate: Date;
  onMonthClick: (month: number) => void;
  onDayClick: (date: Date) => void;
  getEventsForDate: (date: Date) => { regularEvents: CalendarEvent[]; multiDayEvents: CalendarEvent[] };
  getColor: (type: CalendarEvent['type']) => string;
}

// Define event type priority order (same as month view)
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

export const CalendarYear = ({
  currentDate,
  onDayClick,
  getEventsForDate,
  getColor
}: CalendarYearProps) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  return (
    <div className="grid grid-cols-3 gap-4">
      {months.map((month, index) => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), index, 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), index + 1, 0);
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(1 - firstDayOfMonth.getDay());

        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];
        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

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

        return (
          <div
            key={month}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold mb-2">{month}</h3>
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">S</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">M</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">T</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">W</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">T</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">F</div>
              <div className="bg-white px-1 py-0.5 text-xs text-gray-500 font-bold">S</div>
              {weeks.map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const isCurrentMonth = day.getMonth() === index;
                  const isToday = day.toDateString() === new Date().toDateString();
                  const highestPriorityType = getHighestPriorityEventType(day);
                  const bgColor = highestPriorityType ? getColor(highestPriorityType).split(' ')[0] : '';

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrentMonth) {
                          onDayClick(day);
                        }
                      }}
                      className={`${
                        bgColor ? bgColor : isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } p-0.5 text-xs ${
                        !isToday && (isCurrentMonth ? 'text-gray-900' : 'text-gray-400')
                      } ${isCurrentMonth ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <span className={`${ isToday ? 'bg-black text-white rounded-full w-4 h-4 flex items-center justify-center' : '' }`}>{day.getDate()}</span>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 