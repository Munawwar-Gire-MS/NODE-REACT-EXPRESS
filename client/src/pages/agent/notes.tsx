import AgentLayout from "./layout";

export default function AgentNotes() {
  return (
    <AgentLayout>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        
        <div className="mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Create New Note
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">Sample Note</h2>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              This is a sample note. You can add, edit, and delete notes here.
            </p>
          </div>
          
          <div className="border dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">Another Note</h2>
              <span className="text-sm text-gray-500">Yesterday</span>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              This is another sample note with some content.
            </p>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
} 