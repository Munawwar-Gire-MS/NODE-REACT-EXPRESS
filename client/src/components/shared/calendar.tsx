import { ChevronLeft, ChevronRight, Lock, Users, RotateCcw, Search, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';
import { createDummyEvents } from '@/pages/client/data/dummyCalendarEvents';
import { CalendarDay } from '@/components/shared/calendar-day';
import { CalendarWeek } from '@/components/shared/calendar-week';
import { CalendarMonth } from '@/components/shared/calendar-month';
import { CalendarYear } from '@/components/shared/calendar-year';
import { formatEventType, formatTimeDisplay, getColor, getEventIcon, getLocalDateString, getLocalTimeString } from "@/utils/calendar-utils";

// Get user's timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface CalendarProps {
  isAgentView: boolean;
}

export function Calendar({ isAgentView }: CalendarProps) {
  const useDummyData = import.meta.env.VITE_CALENDAR_USE_DUMMY_DATA === 'true';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [connectedAgents, setConnectedAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [connectedClients, setConnectedClients] = useState<Array<{ id: string; name: string }>>([{ id: 'my-calendar', name: 'My Calendar' }]);
  const [selectedClientId, setSelectedClientId] = useState<string>('my-calendar');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<CalendarEvent>({
    date: getLocalDateString(new Date()),
    time: getLocalTimeString(new Date()),
    endDate: getLocalDateString(new Date()),
    endTime: getLocalTimeString(new Date()),
    isMultiDay: false,
    title: '',
    description: '',
    type: 'other',
    visibility: { type: 'private' },
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState<boolean>(false);

  const eventSnippetLength = 100;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (useDummyData) {
          setAllEvents(createDummyEvents(new Date()));
          return;
        }

        // For real data, pass the timezone and let server handle conversion
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);

        if (view === 'week') {
          // For week view, fetch events for the entire week
          startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
          endDate.setDate(startDate.getDate() + 6);
        } else if (view === 'month') {
          // For month view, fetch events for the entire month
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
        } else if (view === 'year') {
          // For year view, fetch events for the entire year
          startDate.setMonth(0, 1);
          endDate.setMonth(11, 31);
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/calendar/events?` + 
          `startDate=${startDate.toISOString().split('T')[0]}T00:00&` +
          `endDate=${endDate.toISOString().split('T')[0]}T23:59&` +
          `timeZone=${encodeURIComponent(userTimeZone)}` +
          (isAgentView && selectedClientId !== 'my-calendar' ? `&clientId=${selectedClientId}` : '')
        );

        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }
        const data = await response.json();
        console.log('Loaded events from API:', data);
        setAllEvents(data);
        setError(null);
      } catch (err) {
        setError('Failed to load calendar events. Please try again later.');
        console.error('Error loading calendar events:', err);
      }
    };

    loadEvents();
  }, [useDummyData, selectedDate, view, selectedClientId, isAgentView]);

  // Fetch connected agents when component mounts
  useEffect(() => {
    if (!useDummyData) {
      fetch('/api/client/agents')
        .then(res => res.json())
        .then(data => {
          setConnectedAgents(data);
        })
        .catch(err => {
          console.error('Error fetching connected agents:', err);
          setError('Failed to load connected agents');
        });
    }
  }, [useDummyData]);

  // Fetch connected clients when component mounts and isAgentView is true
  useEffect(() => {
    if (!useDummyData && isAgentView) {
      fetch('/api/agent/clients')
        .then(res => res.json())
        .then(data => {
          setConnectedClients([{ id: 'my-calendar', name: 'My Calendar' }, ...data]);
        })
        .catch(err => {
          console.error('Error fetching connected clients:', err);
          setError('Failed to load connected clients');
        });
    }
  }, [useDummyData, isAgentView]);

  // Filter clients based on search term
  const filteredClients = connectedClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    // Add validation for specific agents visibility
    if (newEvent.visibility.type === 'selected_agents' && (!newEvent.visibility.agentIds || newEvent.visibility.agentIds.length === 0)) {
      setModalError('Please select at least one agent for event visibility');
      return;
    }
    setModalError(null);

    try {
      // Set visibility to private for agent view
      const eventToSave = { ...newEvent };
      if (isAgentView) {
        eventToSave.visibility = { type: 'private' };
      }

      if (useDummyData) {
        if (editingEvent) {
          setAllEvents(prevEvents => 
            prevEvents.map(e => e === editingEvent ? eventToSave : e)
          );
        } else {
          setAllEvents(prevEvents => [...prevEvents, eventToSave]);
        }
      } else {
        // Send local time and timezone to server
        const eventData = {
          ...eventToSave,
          timeZone: userTimeZone
        };

        console.log('Saving event with local time:', eventData);

        const response = await fetch(`/api/calendar/events${editingEvent ? `/${editingEvent._id}` : ''}`, {
          method: editingEvent ? 'PATCH' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error('Failed to save event');
        }

        const savedEvent = await response.json();
        console.log('Saved event from API:', savedEvent);

        // Use the local time fields from the response
        const eventToAdd = {
          ...savedEvent,
          date: savedEvent.date,
          time: savedEvent.time,
          endDate: savedEvent.endDate,
          endTime: savedEvent.endTime
        };

        console.log('Adding event to collection:', eventToAdd);
        if (editingEvent) {
          setAllEvents(prevEvents => 
            prevEvents.map(e => e._id === editingEvent._id ? eventToAdd : e)
          );
        } else {
          setAllEvents(prevEvents => [...prevEvents, eventToAdd]);
        }
      }

      setShowModal(false);
      setEditingEvent(null);
    } catch (err) {
      setError('Failed to save event. Please try again later.');
      console.error('Error saving event:', err);
    }
  };

  const getEventsForDate = (date: Date): { regularEvents: CalendarEvent[]; multiDayEvents: CalendarEvent[] } => {
    const dateStr = getLocalDateString(date);
    const regularEvents = allEvents.filter(event => 
      event.date === dateStr && !event.isMultiDay
    ) as CalendarEvent[];
    const multiDayEvents = allEvents.filter(event => 
      event.isMultiDay && 
      event.date <= dateStr && 
      event.endDate >= dateStr
    ) as CalendarEvent[];
    return { regularEvents, multiDayEvents };
  };

  // Helper function to check if a date has any booked out events
  const hasBookedOutEvents = (date: Date): boolean => {
    const { regularEvents, multiDayEvents } = getEventsForDate(date);
    return [...regularEvents, ...multiDayEvents].some(event => event.type === 'booked_out');
  };

  // Helper function to check if a date has any on set events
  const hasOnSetEvents = (date: Date): boolean => {
    const { regularEvents, multiDayEvents } = getEventsForDate(date);
    return [...regularEvents, ...multiDayEvents].some(event => event.type === 'on_set');
  };

  // Helper function to check if a date has any episode airing events
  const hasEpisodeAiringEvents = (date: Date): boolean => {
    const { regularEvents, multiDayEvents } = getEventsForDate(date);
    return [...regularEvents, ...multiDayEvents].some(event => event.type === 'episode_airing');
  };

  // Helper function to check if a date has any availability hold events
  const hasAvailabilityHoldEvents = (date: Date): boolean => {
    const { regularEvents, multiDayEvents } = getEventsForDate(date);
    return [...regularEvents, ...multiDayEvents].some(event => event.type === 'availability_hold');
  };

  // Helper function to check if a date has any pinned events
  const hasPinnedEvents = (date: Date): boolean => {
    const { regularEvents, multiDayEvents } = getEventsForDate(date);
    return [...regularEvents, ...multiDayEvents].some(event => event.type === 'pinned');
  };

  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();
  const lastDayOfMonth = new Date(year, currentDate.getMonth(), daysInMonth).getDay();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: new Date(year, currentDate.getMonth(), i - firstDayOfMonth + 1).getDate(),
    currentMonth: false
  }));

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true
  }));

  const nextMonthDays = Array.from({ length: 6 - lastDayOfMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: false
  }));

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number, currentMonth: boolean) => {
    if (!currentMonth) return;
    const clickedDate = new Date(year, currentDate.getMonth(), day);
    if (clickedDate.toDateString() === selectedDate.toDateString()) return;
    setSelectedDate(clickedDate);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDay);
    if (prevDay.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(year, prevDay.getMonth(), 1));
    }
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
    if (nextDay.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(year, nextDay.getMonth(), 1));
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleAddEvent = () => {
    const now = new Date();
    // Round to nearest hour
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    
    const endTime = new Date(now);
    endTime.setHours(now.getHours() + 1);

    setShowModal(true);
    setNewEvent({
      date: getLocalDateString(now),
      time: getLocalTimeString(now),
      endDate: getLocalDateString(endTime),
      endTime: getLocalTimeString(endTime),
      isMultiDay: false,
      title: '',
      description: '',
      type: 'other',
      visibility: { type: 'private' },
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingEvent(null);
    setModalError(null);
    setNewEvent({
      date: getLocalDateString(new Date()),
      time: getLocalTimeString(new Date()),
      endDate: getLocalDateString(new Date()),
      endTime: getLocalTimeString(new Date()),
      isMultiDay: false,
      title: '',
      description: '',
      type: 'other',
      visibility: { type: 'private' },
    });
  };

  const getVisibilityIcon = (event: CalendarEvent) => {
    if (event.visibility.type === 'private') {
      return <Lock className="w-4 h-4 text-gray-500" />;
    }
    return (
      <div className="group relative">
        <Users className="w-4 h-4 text-gray-500" />
        <div className="absolute right-6 top-0 hidden group-hover:block bg-white p-2 rounded shadow-lg z-10 min-w-[150px]">
          <div className="text-sm font-medium text-gray-700">Shared with:</div>
          <ul className="mt-1 text-sm text-gray-600">
            {event.visibility.agentIds?.map((agentId) => {
              const agent = connectedAgents.find(a => a.id === agentId);
              return <li key={agentId}>{agent?.name || agentId}</li>;
            })}
          </ul>
        </div>
      </div>
    );
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(selectedDate);
    prevWeek.setDate(selectedDate.getDate() - 7);
    setSelectedDate(prevWeek);
    if (prevWeek.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(prevWeek.getFullYear(), prevWeek.getMonth(), 1));
    }
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(selectedDate);
    nextWeek.setDate(selectedDate.getDate() + 7);
    setSelectedDate(nextWeek);
    if (nextWeek.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(nextWeek.getFullYear(), nextWeek.getMonth(), 1));
    }
  };

  const getWeekDateRange = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleString('default', { month: 'short' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleString('default', { month: 'short' })} ${endOfWeek.getDate()}`;
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handlePrevYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() - 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const getDateSelectorText = () => {
    if (view === 'year') {
      return currentDate.getFullYear().toString();
    }
    if (view === 'month') {
      return `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
    }
    if (view === 'week') {
      return getWeekDateRange();
    }
    return isToday ? 'Today' : `${selectedDate.toLocaleString('default', { month: 'short' })} ${selectedDate.getDate()}`;
  };

  const handleDateSelectorPrev = () => {
    if (view === 'year') {
      handlePrevYear();
    } else if (view === 'month') {
      handlePrevMonth();
    } else if (view === 'week') {
      handlePrevWeek();
    } else {
      handlePrevDay();
    }
  };

  const handleDateSelectorNext = () => {
    if (view === 'year') {
      handleNextYear();
    } else if (view === 'month') {
      handleNextMonth();
    } else if (view === 'week') {
      handleNextWeek();
    } else {
      handleNextDay();
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      if (useDummyData) {
        setAllEvents(prevEvents => prevEvents.filter(e => e !== event));
      } else {
        const response = await fetch(`/api/calendar/events/${event._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        // Refresh events after deletion
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);

        if (view === 'week') {
          startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
          endDate.setDate(startDate.getDate() + 6);
        } else if (view === 'month') {
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
        } else if (view === 'year') {
          startDate.setMonth(0, 1);
          endDate.setMonth(11, 31);
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const eventsResponse = await fetch(
          `/api/calendar/events?` + 
          `startDate=${startDate.toISOString().split('T')[0]}T00:00&` +
          `endDate=${endDate.toISOString().split('T')[0]}T23:59&` +
          `timeZone=${encodeURIComponent(userTimeZone)}`
        );

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch updated events');
        }

        const data = await eventsResponse.json();
        setAllEvents(data);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again later.');
    }
  };

  const CalendarControls = () => (
    <div className="flex items-center space-x-4">
      {isAgentView && (
        <div className="relative">
          <div 
            className="flex items-center justify-between w-64 border border-gray-300 py-[9px] px-3 rounded-md shadow-sm focus-within:ring-purple-500 focus-within:border-purple-500 cursor-pointer client-dropdown"
            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
          >
            <div className="flex items-center flex-1">
              {selectedClientId === 'my-calendar' ? (
                <span>My Calendar</span>
              ) : (
                <>
                  <span className="truncate">
                    {connectedClients.find(c => c.id === selectedClientId)?.name || selectedClientId}
                  </span>
                </>
              )}
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
          
          {isClientDropdownOpen && (
            <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg client-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="p-2 border-b border-gray-200 flex items-center">
                <Search size={16} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full border-none focus:ring-0 focus:outline-none text-sm"
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        selectedClientId === client.id ? 'bg-purple-100' : ''
                      }`}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setIsClientDropdownOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      {client.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No clients found</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <button 
        onClick={handleTodayClick}
        className="px-5 py-[7px] border border-gray-300 rounded-md shadow-sm bg-secondary hover:bg-secondary/80 text-md font-medium flex items-center space-x-1"
      >
        <span>Today&nbsp;</span>
        <RotateCcw size={14} />
      </button>
      <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
        <button 
          onClick={handleDateSelectorPrev}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2"
        >
          <ChevronLeft size={16} />
        </button>
        <span className={`font-semibold p-[7px] ${view === 'year' ? 'w-20' : view === 'month' ? 'w-48' : 'w-32'} text-center`}>
          {getDateSelectorText()}
        </span>
        <button 
          onClick={handleDateSelectorNext}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <select 
        value={view}
        onChange={(e) => setView(e.target.value as 'day' | 'week' | 'month' | 'year')}
        className="border border-gray-300 py-[9px] px-6 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
      >
        <option value="day">Day view</option>
        <option value="week">Week view</option>
        <option value="month">Month view</option>
        <option value="year">Year view</option>
      </select>
      <button 
        onClick={handleAddEvent} 
        className={`px-4 py-2 rounded-md shadow-sm ${
          isAgentView && selectedClientId !== 'my-calendar' 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-primary text-white hover:bg-primary/80'
        }`}
        disabled={isAgentView && selectedClientId !== 'my-calendar'}
      >
        Add event
      </button>
    </div>
  );

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isClientDropdownOpen && !target.closest('.client-dropdown')) {
        setIsClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClientDropdownOpen]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle={
          view === 'year' ? currentDate.getFullYear().toString() :
          view === 'month' ? month :
          `${selectedDate.toLocaleString('default', { month: 'long' })} ${selectedDate.getFullYear()}`
        }
        action={<CalendarControls />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isAgentView && selectedClientId !== 'my-calendar' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">You are viewing a client's calendar. You cannot edit or delete events.</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 min-h-[600px] overflow-y-auto">
        {view === 'week' ? (
          <CalendarWeek
            selectedDate={selectedDate}
            getEventsForDate={getEventsForDate}
            getEventIcon={getEventIcon}
            getColor={getColor}
            formatTimeDisplay={formatTimeDisplay}
            formatEventType={formatEventType}
            onEditEvent={isAgentView && selectedClientId !== 'my-calendar' ? undefined : handleEditEvent}
          />
        ) : view === 'month' ? (
          <CalendarMonth
            currentDate={currentDate}
            selectedDate={selectedDate}
            getEventsForDate={getEventsForDate}
            getEventIcon={getEventIcon}
            getColor={getColor}
            formatTimeDisplay={formatTimeDisplay}
            formatEventType={formatEventType}
            onDayClick={(day) => {
              setSelectedDate(day);
              if (day.getMonth() !== currentDate.getMonth()) {
                setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
              }
              setView('day');
            }}
          />
        ) : view === 'year' ? (
          <CalendarYear
            currentDate={currentDate}
            onMonthClick={(month) => {
              const newDate = new Date(currentDate.getFullYear(), month, 1);
              setCurrentDate(newDate);
              setSelectedDate(newDate);
              setView('day');
            }}
            onDayClick={(date) => {
              setSelectedDate(date);
              setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
              setView('day');
            }}
            getEventsForDate={getEventsForDate}
            getColor={getColor}
          />
        ) : (
          <CalendarDay
            selectedDate={selectedDate}
            currentDate={currentDate}
            allEvents={allEvents}
            month={month}
            year={year}
            allDays={allDays}
            onDayClick={handleDayClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            hasBookedOutEvents={hasBookedOutEvents}
            hasOnSetEvents={hasOnSetEvents}
            hasEpisodeAiringEvents={hasEpisodeAiringEvents}
            hasAvailabilityHoldEvents={hasAvailabilityHoldEvents}
            hasPinnedEvents={hasPinnedEvents}
            getEventsForDate={getEventsForDate}
            getEventIcon={getEventIcon}
            getColor={getColor}
            getVisibilityIcon={isAgentView && selectedClientId !== 'my-calendar' ? () => <></> : getVisibilityIcon}
            formatTimeDisplay={formatTimeDisplay}
            eventSnippetLength={eventSnippetLength}
            onEditEvent={isAgentView && selectedClientId !== 'my-calendar' ? undefined : handleEditEvent}
            onDeleteEvent={isAgentView && selectedClientId !== 'my-calendar' ? undefined : handleDeleteEvent}
            isAgentView={isAgentView}
            selectedClientId={selectedClientId}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h2 className="text-xl font-bold mb-4">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
            {modalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{modalError}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <span className="text-gray-700">Title</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Title"
                  value={newEvent.title}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, title: e.target.value });
                    if (e.target.value.trim()) {
                      setTitleError(false);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                    titleError 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  required
                />
                {titleError && (
                  <p className="mt-1 text-sm text-red-500">
                    Please enter a title for the event
                  </p>
                )}
              </div>
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={e => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="booked_out">Booked Out</option>
                  <option value="on_set">On Set</option>
                  <option value="episode_airing">Episode Airing</option>
                  <option value="premiere">Premiere</option>
                  <option value="callback">Callback</option>
                  <option value="audition">Audition</option>
                  <option value="class_workshop">Class/Workshop</option>
                  <option value="agency_meeting">Agency Meeting</option>
                  <option value="availability_hold">Availability Hold</option>
                  <option value="pinned">Pinned</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Your timezone)</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setNewEvent({
                        ...newEvent,
                        date: newDate,
                        endDate: newDate
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (Your timezone)</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    disabled={newEvent.isMultiDay}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      const [hours, minutes] = newTime.split(':');
                      const endTime = new Date();
                      endTime.setHours(parseInt(hours) + 1, parseInt(minutes));
                      setNewEvent({
                        ...newEvent,
                        time: newTime,
                        endTime: getLocalTimeString(endTime)
                      });
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                      newEvent.isMultiDay ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Your timezone)</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Your timezone)</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    disabled={newEvent.isMultiDay}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                      newEvent.isMultiDay ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isMultiDay"
                    checked={newEvent.isMultiDay}
                    onChange={(e) => {
                      const isMultiDay = e.target.checked;
                      setNewEvent({
                        ...newEvent,
                        isMultiDay,
                        time: isMultiDay ? '00:00' : newEvent.time,
                        endTime: isMultiDay ? '23:59' : newEvent.endTime
                      });
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isMultiDay" className="text-sm font-medium text-gray-700">
                    Multi-day event
                  </label>
                </div>
              </div>
              {!isAgentView && (
                <div className="flex items-center">
                  <label className="mr-2">Visibility:</label>
                  <select
                    value={newEvent.visibility.type}
                    onChange={(e) => {
                      const visibilityType = e.target.value as 'private' | 'selected_agents';
                      setNewEvent({
                        ...newEvent,
                        visibility: {
                          type: visibilityType,
                          agentIds: visibilityType === 'selected_agents' ? [] : undefined
                        }
                      });
                    }}
                    disabled={connectedAgents.length === 0}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="private">Private</option>
                    <option value="selected_agents" disabled={connectedAgents.length === 0}>
                      {connectedAgents.length === 0 ? 'No agents available' : 'Specific Agents'}
                    </option>
                  </select>
                </div>
              )}

              {!isAgentView && newEvent.visibility.type === 'selected_agents' && connectedAgents.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Select Agents:</label>
                  <div className="space-y-2">
                    {connectedAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newEvent.visibility.agentIds?.includes(agent.id) || false}
                          onChange={(e) => {
                            const agentIds = newEvent.visibility.agentIds || [];
                            const updatedAgentIds = e.target.checked
                              ? [...agentIds, agent.id]
                              : agentIds.filter(id => id !== agent.id);
                            setNewEvent({
                              ...newEvent,
                              visibility: {
                                ...newEvent.visibility,
                                agentIds: updatedAgentIds
                              }
                            });
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">{agent.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleSaveEvent} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 