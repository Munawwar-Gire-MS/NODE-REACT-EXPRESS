import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { EventWarningBanner } from './event-warning-banner';
import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';
import { JSX, useState } from 'react';

interface CalendarDayProps {
  selectedDate: Date;
  currentDate: Date;
  allEvents: CalendarEvent[];
  month: string;
  year: number;
  allDays: Array<{ day: number; currentMonth: boolean }>;
  onDayClick: (day: number, currentMonth: boolean) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hasBookedOutEvents: (date: Date) => boolean;
  hasOnSetEvents: (date: Date) => boolean;
  hasEpisodeAiringEvents: (date: Date) => boolean;
  hasAvailabilityHoldEvents: (date: Date) => boolean;
  hasPinnedEvents: (date: Date) => boolean;
  getEventsForDate: (date: Date) => { regularEvents: CalendarEvent[]; multiDayEvents: CalendarEvent[] };
  getEventIcon: (type: CalendarEvent['type']) => JSX.Element;
  getColor: (type: CalendarEvent['type']) => string;
  getVisibilityIcon: (event: CalendarEvent) => JSX.Element;
  formatTimeDisplay: (date: string, time: string, endDate: string, endTime: string) => string;
  eventSnippetLength: number;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
  isAgentView?: boolean;
  selectedClientId?: string;
}

interface EventSummaryModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatTimeDisplay: (date: string, time: string, endDate: string, endTime: string) => string;
  isAgentView?: boolean;
  selectedClientId?: string;
}

const EventSummaryModal = ({ 
  event, 
  onClose, 
  onEdit, 
  onDelete, 
  formatTimeDisplay,
  isAgentView,
  selectedClientId 
}: EventSummaryModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isViewingClientCalendar = isAgentView && selectedClientId !== 'my-calendar';

  const handleDeleteClick = () => {
    if (isViewingClientCalendar) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (isViewingClientCalendar) return;
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{event.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={isViewingClientCalendar ? undefined : onEdit}
                className={`p-2 rounded-full ${
                  isViewingClientCalendar 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-gray-100'
                }`}
                title={isViewingClientCalendar ? "Cannot edit client's events" : "Edit event"}
                disabled={isViewingClientCalendar}
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={handleDeleteClick}
                className={`p-2 rounded-full ${
                  isViewingClientCalendar 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'hover:bg-red-100 text-red-600'
                }`}
                title={isViewingClientCalendar ? "Cannot delete client's events" : "Delete event"}
                disabled={isViewingClientCalendar}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <p className="mt-1">{formatTimeDisplay(event.date, event.time, event.endDate, event.endTime)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 capitalize">{event.type.replace(/_/g, ' ')}</p>
            </div>
            {event.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1">{event.description}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Visibility</label>
              <p className="mt-1 capitalize">{event.visibility.type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h2 className="text-xl font-bold mb-4">Delete Event</h2>
            <p className="mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const CalendarDay = ({
  selectedDate,
  currentDate,
  month,
  year,
  allDays,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  hasBookedOutEvents,
  hasOnSetEvents,
  hasEpisodeAiringEvents,
  hasAvailabilityHoldEvents,
  hasPinnedEvents,
  getEventsForDate,
  getEventIcon,
  getColor,
  getVisibilityIcon,
  formatTimeDisplay,
  eventSnippetLength,
  onEditEvent,
  onDeleteEvent,
  isAgentView,
  selectedClientId
}: CalendarDayProps) => {
  const eventsForDate = getEventsForDate(selectedDate);
  const hasMultiDayEvents = eventsForDate.multiDayEvents.length > 0;
  const hasRegularEvents = eventsForDate.regularEvents.length > 0;
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = () => {
    if (isAgentView && selectedClientId !== 'my-calendar') return;
    onEditEvent?.(selectedEvent!);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (isAgentView && selectedClientId !== 'my-calendar') return;
    onDeleteEvent?.(selectedEvent!);
    setSelectedEvent(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="w-2/3 pr-18 pb-10 overflow-y-auto">
          <div className="space-y-4">
            {/* Warning banners for different event types */}
            {hasBookedOutEvents(selectedDate) && (
              <EventWarningBanner 
                type="booked_out"
                message="Warning: This date is marked as booked out"
              />
            )}

            {hasOnSetEvents(selectedDate) && (
              <EventWarningBanner 
                type="on_set"
                message="Warning: This date has on-set events"
              />
            )}

            {hasEpisodeAiringEvents(selectedDate) && (
              <EventWarningBanner 
                type="episode_airing"
                message="Warning: This date has episode airing events"
              />
            )}

            {hasAvailabilityHoldEvents(selectedDate) && (
              <EventWarningBanner 
                type="availability_hold"
                message="Warning: This date has availability hold events"
              />
            )}

            {hasPinnedEvents(selectedDate) && (
              <EventWarningBanner 
                type="pinned"
                message="Warning: This date has pinned events"
              />
            )}

            {hasMultiDayEvents && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Multi-day Events</h3>
                <div className="space-y-4">
                  {eventsForDate.multiDayEvents.map((event, index) => (
                    <div 
                      key={`multi-${index}`} 
                      onClick={() => handleEventClick(event)}
                      className={`${getColor(event.type)} p-2 rounded-md shadow-sm cursor-pointer hover:opacity-90`} 
                      title={event.description.length > eventSnippetLength ? event.description : ''}>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-grow">
                          <span className="font-semibold text-lg">
                            {event.date === event.endDate 
                              ? event.date 
                              : `${event.date} - ${event.endDate}`} - {event.title}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          {getVisibilityIcon(event)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-7">{event.description.length > eventSnippetLength ? `${event.description.substring(0, eventSnippetLength)}...` : event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular events section */}
            {hasRegularEvents && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Events</h3>
                {eventsForDate.regularEvents.map((event, index) => (
                  <div
                    key={index}
                    onClick={() => handleEventClick(event)}
                    className={`${getColor(event.type)} p-2 rounded-md shadow-sm cursor-pointer hover:opacity-90`}
                    title={event.description.length > eventSnippetLength ? event.description : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-grow">
                        <span className="font-semibold text-lg">{formatTimeDisplay(event.date, event.time, event.endDate, event.endTime)} - {event.title}</span>
                      </div>
                      <div className="flex-shrink-0">
                        {getVisibilityIcon(event)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-7">{event.description.length > eventSnippetLength ? `${event.description.substring(0, eventSnippetLength)}...` : event.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-1/3 border border-gray-300 rounded-lg p-6">
          <div className="flex items-center justify-center mb-2 border border-gray-300 rounded-md shadow-sm">
            <button onClick={onPrevMonth} className="text-gray-500 hover:text-gray-700 p-2"><ChevronLeft size={16} /></button>
            <span className="font-semibold p-[7px] w-48 text-center">
              {month} {year}
            </span>
            <button onClick={onNextMonth} className="text-gray-500 hover:text-gray-700 p-2"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            <div className="text-center font-semibold text-gray-500">S</div>
            <div className="text-center font-semibold text-gray-500">M</div>
            <div className="text-center font-semibold text-gray-500">T</div>
            <div className="text-center font-semibold text-gray-500">W</div>
            <div className="text-center font-semibold text-gray-500">T</div>
            <div className="text-center font-semibold text-gray-500">F</div>
            <div className="text-center font-semibold text-gray-500">S</div>
            {allDays.map(({ day, currentMonth }, i) => (
              <div
                key={i}
                onClick={() => onDayClick(day, currentMonth)}
                className={`text-center p-1 rounded-full cursor-pointer ${
                  currentMonth 
                    ? (day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() 
                      ? 'bg-black text-white' 
                      : 'text-primary') 
                    : 'text-gray-300'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedEvent && (
        <EventSummaryModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          formatTimeDisplay={formatTimeDisplay}
          isAgentView={isAgentView}
          selectedClientId={selectedClientId}
        />
      )}
    </div>
  );
}; 