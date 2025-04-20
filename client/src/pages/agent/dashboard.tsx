import { PageHeader } from "@/components/ui/page-header.js";
import AgentLayout from "./layout";
import { StatCard } from "@/components/shared/stat-card.js";
import { Heart, CalendarClock, AlertCircle, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from 'react';
import { TodoList } from "@/components/shared/todo-list";

interface Todo {
  _id: string;
  text: string;
  dueDate: string;
  status: 'todo' | 'doing' | 'done';
}

interface DashboardData {
  auditions: number;
  scheduleUpdates: number;
  priorityReplies: number;
  pendingOffers: number;
  todos: Todo[];
}

export default function AgentDashboard() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<DashboardData>({
    auditions: 0,
    scheduleUpdates: 0,
    priorityReplies: 0,
    pendingOffers: 0,
    todos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch dashboard data including todos
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agent-dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AgentLayout>
      <div>
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening today."
        />
        
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isLoading && !error ? (
          <div className="text-center py-4">Loading dashboard data...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="New Auditions"
                value={data.auditions}
                icon={Heart}
                onClick={() => navigate("/agent/submissions")}
              />
              <StatCard
                title="Actor Schedule Updates"
                value={data.scheduleUpdates}
                icon={CalendarClock}
                onClick={() => navigate("/agent/calendar")}
              />
              <StatCard
                title="Priority Replies Needed"
                value={data.priorityReplies}
                icon={AlertCircle}
                onClick={() => navigate("/agent/chat")}
              />
              <StatCard
                title="Pending Offers"
                value={data.pendingOffers}
                icon={Gift}
                onClick={() => navigate("/agent/contracts")}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <TodoList 
                todos={data.todos} 
                onTodosChange={fetchDashboardData}
              />
            </div>
          </>
        )}
      </div>
    </AgentLayout>
  );
} 