import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { TodoModal } from './todo-modal';

interface Todo {
  _id: string;
  text: string;
  dueDate: string;
  status: 'todo' | 'doing' | 'done';
}

interface TodoListProps {
  todos: Todo[];
  onTodosChange?: () => void;
}

export function TodoList({ todos = [], onTodosChange }: TodoListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  // Function to add a new todo
  const addTodo = async (todo: Omit<Todo, '_id'>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add todo');
      }
      
      if (onTodosChange) {
        onTodosChange();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to update a todo
  const updateTodo = async (id: string, updates: Partial<Omit<Todo, '_id'>>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      if (onTodosChange) {
        onTodosChange();
      }
      setIsModalOpen(false);
      setCurrentTodo(null);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a todo
  const deleteTodo = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      
      if (onTodosChange) {
        onTodosChange();
      }
      setIsDeleteModalOpen(false);
      setTodoToDelete(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening the edit modal
  const handleEdit = (todo: Todo) => {
    setCurrentTodo(todo);
    setIsModalOpen(true);
  };

  // Handler for opening the delete confirmation
  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handler for closing modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTodo(null);
  };

  // Helper to get status badge class
  const getStatusBadgeClass = (status: Todo['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-purple-600 text-white';
      case 'doing':
        return 'bg-pink-300 text-gray-800';
      case 'done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Sort todos by status and due date
  const sortedTodos = [...todos].sort((a, b) => {
    // First sort by status - 'done' items go to the end
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    
    // If both not done or both done, sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Helper function to format due date
  const formatDueDate = (dueDate: string) => {
    // Create a date object from the ISO string (stored in UTC)
    const date = new Date(dueDate);
    
    // Format the date in the user's locale and timezone
    // Use specific options to ensure consistent display
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Force UTC to preserve the date as selected by user
    });
  };

  return (
    <div className="mt-6 border border-gray rounded-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">To Do</h2>
        <Button 
          onClick={() => {
            setCurrentTodo(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/80 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="rounded-md h-[300px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading tasks...</p>
          </div>
        ) : sortedTodos.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No tasks found</p>
          </div>
        ) : (
          <ul className="divide-y">
            {sortedTodos.map((todo) => (
              <li key={todo._id} className="p-4 hover:bg-gray-50 border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{todo.text}</div>
                    <div className="text-sm text-gray-500">
                      Due: {formatDueDate(todo.dueDate)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(todo.status)}`}>
                      {todo.status}
                    </span>
                    <button 
                      onClick={() => handleEdit(todo)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(todo._id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Todo Add/Edit Modal */}
      {isModalOpen && (
        <TodoModal
          todo={currentTodo}
          onClose={handleCloseModal}
          onSave={(todoData: Omit<Todo, '_id'>) => {
            if (currentTodo) {
              updateTodo(currentTodo._id, todoData);
            } else {
              addTodo(todoData);
            }
          }}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && todoToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this task?</p>
            <div className="flex justify-end mt-6 gap-2">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteTodo(todoToDelete)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 