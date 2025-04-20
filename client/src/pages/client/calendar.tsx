import ClientLayout from "./layout";
import { Calendar } from '@/components/shared/calendar';

export default function CalendarPage() {
  return (
    <ClientLayout>
      <Calendar isAgentView={false} />
    </ClientLayout>
  );
} 