import { useEffect, useState } from 'react';
import AgentLayout from './layout';
import { PageHeader } from '@/components/ui/page-header';
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/toast";
import { Edit, Archive, UserPlus } from 'lucide-react';
import { EditClientSheet } from '@/components/agent/edit-client-sheet'; // Updated import path
import { ClientProfileModal } from '@/components/agent/client-profile-modal';
import { Representation, User } from '../../../../shared/schema.js';
import { format } from 'date-fns';
import { Link } from 'wouter';

// Define the combined type for roster data
export type RosterEntry = Representation & { client: User | null };

// Helper function to format representation type
const formatRepresentationType = (mediaTypes?: string[]): string => {
  if (!mediaTypes || mediaTypes.length === 0) return 'N/A';
  return mediaTypes.join(', '); 
};

// Helper function to format status
const formatStatus = (status: Representation['status']): string => {
  switch (status) {
    case 'active': return 'Active';
    case 'on_set': return 'On Set';
    case 'away': return 'Away';
    case 'on_hold': return 'On Hold';
    case 'inactive': return 'Inactive';
    case 'pending': return 'Pending';
    default: return status;
  }
};

// Helper function to get badge styles based on status (Tailwind classes)
const getStatusBadgeClasses = (status: Representation['status']): string => {
  const baseClasses = "inline-block px-2 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case 'active': return `${baseClasses} bg-primary/20 text-primary`; // Using primary branded color
    case 'on_set': return `${baseClasses} bg-yellow-100 text-yellow-800`; 
    case 'away': return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'on_hold': return `${baseClasses} bg-red-100 text-red-800`;
    case 'inactive': return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'pending': return `${baseClasses} bg-blue-100 text-blue-800`;
    default: return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export default function AgentRoster() {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const [selectedClient, setSelectedClient] = useState<RosterEntry | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<string | null>(null); // Store ID to archive
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileClient, setSelectedProfileClient] = useState<User | null>(null);

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/roster');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch roster: ${response.status}`);
      }
      const data = await response.json();
      setRoster(data);
    } catch (err) {
      console.error('Error fetching roster:', err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      showToast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleEdit = (client: RosterEntry) => {
    setSelectedClient(client);
    setIsSheetOpen(true);
  };

  const handleArchiveAction = async () => {
    if (!showArchiveConfirm) return;
    const representationId = showArchiveConfirm;
    setShowArchiveConfirm(null); // Close modal immediately

    try {
      const response = await fetch(`/api/roster/${representationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to archive client');
      }
      showToast({ title: "Success", description: "Client representation archived" });
      fetchRoster(); // Refresh list
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      showToast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleSheetClose = (updated?: boolean) => {
    setIsSheetOpen(false);
    setSelectedClient(null);
    if (updated) {
        fetchRoster(); 
    }
  }

  const handleViewProfile = (client: User | null) => {
    if (!client) return;
    setSelectedProfileClient(client);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfileClient(null);
  };

  return (
    <AgentLayout>
      <div>
        <PageHeader
          title="Client Roster"
          subtitle="Manage your represented clients"
          action={
            <Link href="/agent/invites">
              <button className="inline-flex items-center px-4 py-2 border border-transparent cursor-pointer rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Clients
              </button>
            </Link>
          }
        />

        {loading && <p className="text-center py-4">Loading...</p>}
        {error && <p className="text-center py-4 text-red-600">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Next Key Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Representation Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roster.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                            No clients found.
                            </td>
                        </tr>
                        ) : (
                        roster.map((entry) => (
                            <tr key={entry._id?.toString()}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {entry.client ? (
                                  <button
                                    onClick={() => handleViewProfile(entry.client)}
                                    className="hover:text-primary hover:underline focus:outline-none focus:text-primary"
                                  >
                                    {entry.client.name.first} {entry.client.name.last}
                                  </button>
                                ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.client?.username ?? 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.nextKeyDate ? format(new Date(entry.nextKeyDate), 'PP') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatRepresentationType(entry.terms?.mediaTypes)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={getStatusBadgeClasses(entry.status)}>
                                {formatStatus(entry.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button 
                                    onClick={() => handleEdit(entry)}
                                    className="text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 p-1 rounded"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => entry.status !== 'inactive' ? setShowArchiveConfirm(entry._id?.toString() || null) : undefined}
                                    className={`focus:outline-none focus:ring-2 focus:ring-offset-2 p-1 rounded ${
                                      entry.status === 'inactive' 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-red-600 hover:text-red-800 focus:ring-red-500/50'
                                    }`}
                                    title={entry.status === 'inactive' ? 'Already inactive' : 'Archive'}
                                    disabled={entry.status === 'inactive'}
                                >
                                    <Archive className="h-4 w-4" />
                                </button>
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}
      </div>
      <Toast toast={toast} />

      {/* Edit Sheet Component */}  
      {selectedClient && (
        <EditClientSheet 
            isOpen={isSheetOpen} 
            onClose={handleSheetClose} 
            clientData={selectedClient} 
        />
      )}

      {/* Client Profile Modal */}
      {showProfileModal && (
        <ClientProfileModal
          client={selectedProfileClient}
          onClose={handleCloseProfileModal}
        />
      )}

      {/* Archive Confirmation Modal */} 
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="archive-modal-title" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 id="archive-modal-title" className="text-lg font-medium leading-6 text-gray-900">Archive Representation</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to archive this client representation?
                This action will mark the representation as inactive. It can be reactivated later if needed.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                onClick={handleArchiveAction}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(null)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AgentLayout>
  );
} 