import AgentLayout from "./layout";
import { Calendar } from '@/components/shared/calendar';

export default function CalendarPage() {
  return (
    <AgentLayout>
      <Calendar isAgentView={true} />
    </AgentLayout>
  );
} 