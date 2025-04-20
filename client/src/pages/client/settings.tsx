import ClientLayout from "./layout";

export default function ClientSettings() {
  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p>Settings component content goes here</p>
        </div>
      </div>
    </ClientLayout>
  );
} 