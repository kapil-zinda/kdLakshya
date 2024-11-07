import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';
import { Check } from 'lucide-react';

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

interface TodoData {
  allowed_priority: string[];
}

export function DataTableRowPriority({
  row,
  updateTask,
  allowedPriority,
}: {
  row: any; // Type as needed
  updateTask: (id: number | string, data: Partial<TodoTask>) => void;
  allowedPriority: string[]; // Passed from todoData.allowed_priority
}) {
  const [editedPriority, setEditedPriority] = useState(
    row.getValue('priority') as string,
  );

  const handlePriorityChange = (newPriority: string) => {
    setEditedPriority(newPriority);
    updateTask(row.original.id, { priority: newPriority });
  };

  if (!allowedPriority.length) {
    return null; // Return null if there are no allowed priorities
  }

  const currentPriority = allowedPriority.find(
    (priority) => priority === editedPriority,
  );

  return (
    <div className="flex items-center">
      <Select
        value={editedPriority}
        onValueChange={handlePriorityChange}
        defaultValue={currentPriority}
      >
        <SelectTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 outline-none">
          <SelectValue>{currentPriority || 'Select priority'}</SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {allowedPriority.map((priority) => (
            <SelectItem
              key={priority}
              value={priority}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectItemIndicator>
                  <Check className="h-4 w-4" />
                </SelectItemIndicator>
              </span>
              <div className="flex gap-2 items-center">{priority}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
