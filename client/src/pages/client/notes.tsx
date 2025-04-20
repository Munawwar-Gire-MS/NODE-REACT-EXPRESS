import ClientLayout from "./layout";

export default function ClientNotes() {
  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Notes & Feedback</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p>Notes & Feedback component content goes here</p>
        </div>
      </div>
    </ClientLayout>
  );
} 