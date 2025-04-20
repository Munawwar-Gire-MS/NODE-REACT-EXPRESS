import { Route, Switch } from "wouter";
import Login from "./pages/login";
import Register from "./pages/register";
import AgentDashboard from "./pages/agent/dashboard";
import AgentProfile from "./pages/agent/profile";
import AgentNotes from "./pages/agent/notes";
import AgentInvites from "./pages/agent/invites";
import AgentRoster from "./pages/agent/roster";
import AgentCalendar from "./pages/agent/calendar";
import ClientDashboard from "./pages/client/dashboard";
import ClientProfile from "./pages/client/profile";
import ClientNotes from "./pages/client/notes";
import ClientCalendar from "./pages/client/calendar";
import ClientMessages from "./pages/client/messages";
import ClientSettings from "./pages/client/settings";
import AdminWhitelist from "./pages/admin/whitelist";
import { ProtectedRoute } from "./components/protected-route";
import { AuthProvider } from "./contexts/auth";
import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Sandbox from './pages/sandbox';
// Default redirect component
function DefaultRedirect() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setLocation(user.role === 'agent' ? '/agent/dashboard' : '/client');
      } else {
        setLocation('/login');
      }
    }
  }, [user, loading, setLocation]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/sandbox" component={Sandbox} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Admin Routes */}
        <Route path="/admin/whitelist">
          <ProtectedRoute>
            <AdminWhitelist />
          </ProtectedRoute>
        </Route>
        
        {/* Agent Routes */}
        <Route path="/agent">
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/dashboard">
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/profile">
          <ProtectedRoute requiredRole="agent">
            <AgentProfile />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/notes">
          <ProtectedRoute requiredRole="agent">
            <AgentNotes />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/invites">
          <ProtectedRoute requiredRole="agent">
            <AgentInvites />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/roster">
          <ProtectedRoute requiredRole="agent">
            <AgentRoster />
          </ProtectedRoute>
        </Route>
        <Route path="/agent/calendar">
          <ProtectedRoute requiredRole="agent">
            <AgentCalendar />
          </ProtectedRoute>
        </Route>
        
        {/* Client Routes */}
        <Route path="/client">
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/client/dashboard">
          <ProtectedRoute requiredRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/client/profile">
          <ProtectedRoute requiredRole="client">
            <ClientProfile />
          </ProtectedRoute>
        </Route>
        <Route path="/client/notes">
          <ProtectedRoute requiredRole="client">
            <ClientNotes />
          </ProtectedRoute>
        </Route>
        <Route path="/client/calendar">
          <ProtectedRoute requiredRole="client">
            <ClientCalendar />
          </ProtectedRoute>
        </Route>
        <Route path="/client/messages">
          <ProtectedRoute requiredRole="client">
            <ClientMessages />
          </ProtectedRoute>
        </Route>
        <Route path="/client/settings">
          <ProtectedRoute requiredRole="client">
            <ClientSettings />
          </ProtectedRoute>
        </Route>
        
        {/* Default Route */}
        <Route path="/">
          <DefaultRedirect />
        </Route>
      </Switch>
    </AuthProvider>
  );
}