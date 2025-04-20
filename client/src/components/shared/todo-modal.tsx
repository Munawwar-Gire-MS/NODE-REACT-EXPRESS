import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Todo {
  _id: string;
  text: string;
  dueDate: string;
  status: 'todo' | 'doing' | 'done';
}

interface TodoModalProps {
  todo: Todo | null;
  onClose: () => void;
  onSave: (todo: Omit<Todo, '_id'>) => void;
}

export function TodoModal({ todo, onClose, onSave }: TodoModalProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo');

  // Set initial values if editing an existing todo
  useEffect(() => {
    if (todo) {
      setText(todo.text);
      
      // Get the date from the ISO string
      const date = new Date(todo.dueDate);
      
      // Format as YYYY-MM-DD in local timezone without time component
      // This ensures the date picker shows the correct date regardless of time
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setDueDate(formattedDate);
      setStatus(todo.status);
    } else {
      // Set default values for new todo - tomorrow in local timezone
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      const formattedTomorrow = `${year}-${month}-${day}`;
      
      setDueDate(formattedTomorrow);
    }
  }, [todo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!text.trim()) {
      alert('Please enter a task description');
      return;
    }
    
    // Parse the date string to a Date object
    // Create the date at noon in the user's timezone to avoid any day boundary issues
    const [year, month, day] = dueDate.split('-').map(num => parseInt(num, 10));
    const selectedDate = new Date(year, month - 1, day, 12, 0, 0);
    
    onSave({
      text,
      dueDate: selectedDate.toISOString(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {todo ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Task</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter task description"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'todo' | 'doing' | 'done')}
              className="w-full p-2 border rounded-md"
            >
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {todo ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 