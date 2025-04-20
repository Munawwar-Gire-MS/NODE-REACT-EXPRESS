import { useAuth } from "@/contexts/auth";
import AgentLayout from "./layout";

export default function AgentProfile() {
  const { user } = useAuth();
  
  // Get the user's display name
  const displayName = user?.name 
    ? (typeof user.name === 'string' 
        ? user.name 
        : `${user.name.first} ${user.name.last}`)
    : 'Agent';

  return (
    <AgentLayout>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Agent Profile</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Name</h2>
            <p>{displayName}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Username</h2>
            <p>{user?.username || 'No username provided'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">Role</h2>
            <p>Agent</p>
          </div>
          
          <div className="pt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
} 