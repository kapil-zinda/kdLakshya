import { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';
import { Row } from '@tanstack/react-table';
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

export function DataTableRowStatus({
  row,
  updateTask,
  allowedStatus,
}: {
  row: Row<TodoTask>;
  updateTask: (id: number | string, data: Partial<TodoTask>) => void;
  allowedStatus: string[]; // Passed from todoData.allowed_status
}) {
  const [editedStatus, setEditedStatus] = useState(
    row.getValue('status') as string,
  );

  const handleStatusChange = (newStatus: string) => {
    setEditedStatus(newStatus);
    updateTask(row.original.id, { status: newStatus });
  };

  if (!allowedStatus.length) {
    return null; // Return null if there are no allowed statuses
  }

  const currentStatus = allowedStatus.find((status) => status === editedStatus);

  return (
    <div className="flex items-center">
      <Select
        value={editedStatus}
        onValueChange={handleStatusChange}
        defaultValue={currentStatus}
      >
        <SelectTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 outline-none">
          <SelectValue>{currentStatus || 'Select status'}</SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {allowedStatus.map((status) => (
            <SelectItem
              key={status}
              value={status}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectItemIndicator>
                  <Check className="h-4 w-4" />
                </SelectItemIndicator>
              </span>
              <div className="flex gap-2 items-center">{status}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
