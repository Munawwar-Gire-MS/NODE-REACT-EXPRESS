import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import AgentLayout from "./layout";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/toast";

interface InviteFormData {
  email: string;
  name: string;
}

interface InviteResponse {
  message: string;
  clientId: string;
  representationId: string;
  isNewClient: boolean;
  magicLink: string | null;
}

export default function InvitesPage() {
  const { toast, showToast } = useToast();
  const [formData, setFormData] = useState<InviteFormData>({
    email: "",
    name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastInviteResponse, setLastInviteResponse] = useState<InviteResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send invite");
      }

      const data = await response.json();
      setLastInviteResponse(data);

      showToast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      // Reset form
      setFormData({
        email: "",
        name: ""
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      showToast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = () => {
    showToast({
      title: "Coming Soon",
      description: "Bulk upload feature is currently under development.",
    });
  };

  const copyMagicLink = () => {
    if (lastInviteResponse?.magicLink) {
      navigator.clipboard.writeText(lastInviteResponse.magicLink);
      showToast({
        title: "Copied",
        description: "Magic link copied to clipboard",
      });
    }
  };

  return (
    <AgentLayout>
      <div>
        <PageHeader
          title="Invite Clients"
          subtitle="Invite individual clients or upload a list of clients to invite"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Individual Invite Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Invite Individual Client</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </button>
              </form>

              {lastInviteResponse?.magicLink && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Magic Link for Client</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={lastInviteResponse.magicLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm"
                    />
                    <button
                      onClick={copyMagicLink}
                      className="px-3 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Share this link with your client so they can set up their account.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Upload Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Bulk Upload</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Upload a CSV file containing client information to send multiple invitations at once.
                </p>
                <div className="space-y-2">
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                    CSV File
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".csv"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  onClick={handleBulkUpload}
                  disabled
                  className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload and Send Invitations
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast} />
    </AgentLayout>
  );
} 