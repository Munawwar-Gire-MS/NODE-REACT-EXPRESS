import { formatInTimeZone } from 'date-fns-tz';
export function formatDateForClient(date, timeZone) {
    const dateStr = formatInTimeZone(date, timeZone, 'yyyy-MM-dd');
    const timeStr = formatInTimeZone(date, timeZone, 'HH:mm');
    return { date: dateStr, time: timeStr };
}
