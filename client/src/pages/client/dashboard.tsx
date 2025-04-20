import ClientLayout from "./layout";

export default function ClientDashboard() {
  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Welcome to your client dashboard!</h2>
          <p className="text-gray-600">
            This is where you can view your upcoming auditions, manage your profile, and communicate with your agent.
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}