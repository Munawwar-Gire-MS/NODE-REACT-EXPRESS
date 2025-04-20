import { useLocation } from "wouter";
import { useState } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";

// Note: You'll need to install lucide-react if not already installed:
// npm install lucide-react

// Define navigation items based on the screenshot
const navigation = [
  { name: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
  { name: "Client Roster", href: "/agent/roster", icon: Users },
  { name: "Invite Clients", href: "/agent/invites", icon: UserPlus },
  { name: "Submissions", href: "/agent/submissions", icon: FileSpreadsheet },
  { name: "Calendar", href: "/agent/calendar", icon: Calendar },
  { name: "Notes & Feedback", href: "/agent/notes", icon: FileText },
  { name: "Messages", href: "/agent/messages", icon: MessageSquare },
  { name: "Contracts & Deals", href: "/agent/contracts", icon: FileText },
  { name: "Settings", href: "/agent/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    setLocation(href);
  };

  const NavigationItems = () => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? "bg-[#F4EBFF] text-[#6941C6] hover:bg-[#F9F5FF]"
                : "text-gray-600 hover:bg-gray-700/20"
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#6941C6]" : "text-gray-500"}`} />
            {item.name}
          </button>
        );
      })}
    </div>
  );

  const UserIdentifier = () => (
    <div className="p-4">
      <button
        onClick={() => handleNavigation("/agent/settings")}
        className="w-full flex items-center px-3 py-2 bg-primary/20 cursor-pointer text-sm text-gray-600 hover:bg-gray-100 hover:bg-primary/40 hover:text-white rounded-md group relative"
        title={user?.username}
      >
        <Users className="mr-3 h-5 w-5 text-gray-500" />
        <span>Hello, {user?.name.first}</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col h-screen bg-[#F8FAFC]">
          <div className="flex-shrink-0 h-16 flex items-center px-4">
            <img src="/images/tf-logo.png" alt="TalentFlow" className="h-20" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <NavigationItems />
          </nav>

          {/* Upgrade Now Section */}
          <div className="p-4">
            <div className="bg-[#F9F5FF] rounded-lg p-4">
              <h3 className="text-sm font-semibold text-[#6941C6]">Upgrade Now</h3>
              <p className="text-sm text-gray-600">Get more features</p>
            </div>
          </div>

          {/* User Identifier */}
          <UserIdentifier />

          {/* Logout Button */}
          <div className="flex-shrink-0 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8FAFC] border-b md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <img src="/images/tf-logo.png" alt="TalentFlow" className="h-8" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#F8FAFC] shadow-lg">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <img src="/images/tf-logo.png" alt="TalentFlow" className="h-8" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col h-full">
              <div className="flex-1 px-2 py-4">
                <NavigationItems />
              </div>
              <div className="p-4">
                <div className="bg-[#F9F5FF] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-[#6941C6]">Upgrade Now</h3>
                  <p className="text-sm text-gray-600">Get more features</p>
                </div>
              </div>
              
              {/* User Identifier */}
              <UserIdentifier />

              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-64 bg-white">
        <div className="py-6 px-4 md:px-8 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
} 