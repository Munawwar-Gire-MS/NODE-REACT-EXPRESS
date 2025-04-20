import { CalendarEvent } from '@/pages/client/dtos/calendarEvent';
import { Tv, Projector, Repeat, Square, Brain, HandshakeIcon, Timer, PinIcon, FileText, Calendar1 } from 'lucide-react';

export const getLocalDateString = (date: Date): string => {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

export const getLocalTimeString = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour12: false }).substring(0, 5);
};

export const formatTimeDisplay = (date: string, time: string, endDate: string, endTime: string) => {
  const startLocal = new Date(`${date}T${time}:00`);
  const endLocal = new Date(`${endDate}T${endTime}:00`);
  
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (endDate !== date) {
    return `${formatTime(startLocal)} - ${endLocal.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${formatTime(endLocal)}`;
  }
  return `${formatTime(startLocal)} - ${formatTime(endLocal)}`;
};

export const getEventIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'episode_airing':
      return <Tv className="w-4 h-4" />;
    case 'premiere':
      return <Projector className="w-4 h-4" />;
    case 'callback':
      return <Repeat className="w-4 h-4" />;
    case 'audition':
      return <Square className="w-4 h-4" />;
    case 'class_workshop':
      return <Brain className="w-4 h-4" />;
    case 'agency_meeting':
      return <HandshakeIcon className="w-4 h-4" />;
    case 'availability_hold':
      return <Timer className="w-4 h-4" />;
    case 'pinned':
      return <PinIcon className="w-4 h-4" />;
    case 'deadline':
      return <FileText className="w-4 h-4" />;
    default:
      return <Calendar1 className="w-4 h-4" />;
  }
};

export const getColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'booked_out':
      return 'bg-red-50 text-red-700';
    case 'on_set':
      return 'bg-purple-100 text-purple-700';
    case 'episode_airing':
      return 'bg-blue-50 text-blue-900';
    case 'premiere':
      return 'bg-gray-50 text-yellow-600';
    case 'callback':
      return 'bg-gray-50 text-orange-500';
    case 'audition':
      return 'bg-gray-50 text-teal-600';
    case 'class_workshop':
      return 'bg-gray-50 text-gray-700';
    case 'agency_meeting':
      return 'bg-gray-50 text-red-400';
    case 'availability_hold':
      return 'bg-cyan-50 text-cyan-700';
    case 'pinned':
      return 'bg-amber-50 text-amber-700';
    case 'deadline':
      return 'bg-gray-50 text-red-600';
    case 'other':
      return 'bg-gray-50 text-emerald-600';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

export const formatEventType = (type: CalendarEvent['type']) => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
