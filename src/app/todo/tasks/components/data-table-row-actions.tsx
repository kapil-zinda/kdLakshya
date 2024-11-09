'use client';

import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';

// Define the TodoTask interface
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

// Define the props for DataTableRowActions
interface DataTableRowActionsProps<TData> {
  row: Row<TData>; // The row object from the table, representing a task
  deleteTask: (id: number) => void; // Function to delete a task by its id
  duplicateTask: (task: TData) => void; // Function to duplicate a task
  setsectedtask: Dispatch<SetStateAction<TodoTask | null>>;
  seteditmodelopen: Dispatch<SetStateAction<boolean>>;
}

export function DataTableRowActions<TData extends TodoTask>({
  row,
  deleteTask,
  duplicateTask,
  setsectedtask,
  seteditmodelopen,
}: DataTableRowActionsProps<TData>) {
  const task = row.original; // Access the row's original data

  const handleDelete = () => {
    deleteTask(task.id); // Call deleteTask with the task id
  };

  const handleCopy = () => {
    duplicateTask(task); // Call duplicateTask with the task object
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setsectedtask(task);
            seteditmodelopen(true);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>Make a copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
