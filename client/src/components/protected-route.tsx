import { useAuth } from "@/contexts/auth";
import { useLocation } from "wouter";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "agent" | "client";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {  // Only redirect after initial load
      if (!user) {
        // Redirect to login if not authenticated
        setLocation("/login");
      } else if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard if wrong role
        setLocation(user.role === "agent" ? "/agent" : "/client");
      }
    }
  }, [user, loading, requiredRole, setLocation]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show nothing if not authenticated or wrong role
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 