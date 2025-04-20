import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWeekProps {
  selectedDate: Date;
  getEventsForDate: (date: Date) => { regularEvents: CalendarEvent[]; multiDayEvents: CalendarEvent[] };
  getEventIcon: (type: CalendarEvent['type']) => React.ReactNode;
  getColor: (type: CalendarEvent['type']) => string;
  formatTimeDisplay: (date: string, time: string, endDate: string, endTime: string) => string;
  formatEventType: (type: CalendarEvent['type']) => string;
  onEditEvent?: (event: CalendarEvent) => void;
}

// Define event type priority order
const EVENT_TYPE_PRIORITY: Record<CalendarEvent['type'], number> = {
  'booked_out': 1,
  'on_set': 2,
  'episode_airing': 3,
  'premiere': 4,
  'callback': 5,
  'audition': 6,
  'class_workshop': 7,
  'agency_meeting': 8,
  'availability_hold': 9,
  'pinned': 10,
  'deadline': 11,
  'other': 12
};

export const CalendarWeek = ({
  selectedDate,
  getEventsForDate,
  getEventIcon,
  getColor,
  formatTimeDisplay,
  onEditEvent
}: CalendarWeekProps) => {
  // Get the start of the week (Sunday) for the selected date
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  // Generate array of 7 days starting from Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    if (i === 0) {
      day.setHours(0, 0, 0, 0);
    } else if (i === 6) {
      day.setHours(23, 59, 59, 999);
    }
    return day;
  });

  // Get all multi-day events that span the week
  const multiDayEvents = weekDays.reduce((events, day) => {
    const { multiDayEvents } = getEventsForDate(day);
    multiDayEvents.forEach(event => {
      if (!events.some(e => e.date === event.date && e.time === event.time)) {
        events.push(event);
      }
    });
    return events;
  }, [] as CalendarEvent[]);

  // Sort multi-day events by priority
  const sortedMultiDayEvents = [...multiDayEvents].sort((a, b) => 
    EVENT_TYPE_PRIORITY[a.type] - EVENT_TYPE_PRIORITY[b.type]
  );

  return (
    <div className="flex flex-col">
      {/* Multi-day events section */}
      {sortedMultiDayEvents.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-px">
            {sortedMultiDayEvents.map((event, index) => {
              const startDate = new Date(`${event.date}T${event.time}:00`);
              const endDate = new Date(`${event.endDate}T${event.endTime}:00`);
              const startsBeforeWeek = startDate < weekDays[0];
              const endsAfterWeek = endDate > weekDays[6];
              console.log('[DEBUG] weekDays', weekDays[0], weekDays[6]);
              console.log('[DEBUG] startDate', startDate);
              console.log('[DEBUG] endDate', endDate);
              console.log('[DEBUG] startsBeforeWeek', startsBeforeWeek);
              console.log('[DEBUG] endsAfterWeek', endsAfterWeek);
              const startCol = startsBeforeWeek ? 1 : startDate.getDay() + 1;
              const endCol = endsAfterWeek ? 7 : endDate.getDay() + 1;

              return (
                <div 
                  key={index}
                  className={`${getColor(event.type)} p-2 rounded text-sm flex items-center cursor-pointer gap-2 hover:opacity-90`}
                  onClick={() => onEditEvent?.(event)}
                  style={{
                    gridColumn: `${startCol} / ${endCol + 1}`,
                  }}
                >
                  {startsBeforeWeek && <ChevronLeft className="w-4 h-4" />}
                  {getEventIcon(event.type)}
                  <span className="font-medium">{event.title}</span>
                  {endsAfterWeek && <ChevronRight className="w-4 h-4 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 min-h-[600px]">
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className={`bg-white h-full flex flex-col ${
              day.toDateString() === new Date().toDateString() 
                ? 'bg-purple-50'
                : ''
            }`}
          >
            <div className="px-2 py-3 sticky top-0 bg-white z-10 border-b">
              <div className="text-xs text-gray-500 uppercase">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-sm font-semibold ${
                day.toDateString() === new Date().toDateString()
                  ? 'bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center'
                  : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
            </div>
            
            <div className="p-2 space-y-2">
              {getEventsForDate(day).regularEvents.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={`${getColor(event.type)} p-2 rounded text-sm cursor-pointer hover:opacity-90`}
                  title={event.description}
                  onClick={() => onEditEvent?.(event)}
                >
                  <div className="font-medium flex items-center gap-2">
                    {formatTimeDisplay(event.date, event.time, event.endDate, event.endTime).split(' - ')[0]} - {event.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 