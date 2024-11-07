import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Row } from '@tanstack/react-table'; // Import type from react-table if not already done

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

interface DataTableRowTitleProps {
  row: Row<TodoTask>;
}

export function DataTableRowTitle({
  row,
  updateTask,
}: {
  row: Row<TodoTask>;
  updateTask: (id: number | string, data: Partial<TodoTask>) => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(
    row.getValue('name') as string,
  );

  const handleTitleClick = () => setEditing(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditedTitle(e.target.value);

  const handleTitleBlur = () => {
    setEditing(false);
    updateTask(row.original.id, { name: editedTitle });
  };

  return (
    <div className="flex space-x-2">
      {isEditing ? (
        <Input
          type="text"
          value={editedTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          className="max-w-[500px] truncate font-medium px-2 border-none h-full"
        />
      ) : (
        <span
          onClick={handleTitleClick}
          className="max-w-[500px] truncate font-medium"
          title="Click to Edit"
        >
          {editedTitle}
        </span>
      )}
    </div>
  );
}
