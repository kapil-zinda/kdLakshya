import React, { useCallback, useEffect } from 'react';

import { Calendar } from 'lucide-react';

interface TodoTask {
  id: number;
  name: string;
  status: string;
  priority: string;
  importance: string;
  due_date: string;
  category: string;
  start_date?: string;
}

interface AllowedFields {
  allowed_priority: string[];
  allowed_status: string[];
  allowed_category: string[];
}

interface TaskEditModalProps {
  task: TodoTask;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, updatedData: Partial<TodoTask>) => Promise<void>;
  allowedFields: AllowedFields;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  allowedFields,
}) => {
  const [editedTask, setEditedTask] = React.useState<TodoTask>(task);
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const validateDate = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(2000 + year, month - 1, day);

    return inputDate >= today;
  };

  const handleChange = (field: keyof TodoTask, value: string): void => {
    if (field === 'due_date') {
      if (!validateDate(value)) {
        setError('Due date must be today or later');
        return;
      }
    }
    setError('');
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (error) return;

    try {
      await onUpdate(editedTask.id, editedTask);
      onClose();
    } catch (err) {
      setError('Failed to update task. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 text-white p-6 rounded-lg max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Name</label>
            <input
              type="text"
              value={editedTask?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={editedTask?.priority || ''}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
            >
              {allowedFields.allowed_priority.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editedTask?.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
            >
              {allowedFields.allowed_status.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={editedTask?.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500"
            >
              {allowedFields.allowed_category.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <div className="relative">
              <input
                type="text"
                value={editedTask?.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
                placeholder="DD/MM/YY"
                className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <Calendar className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!!error}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
