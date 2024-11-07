import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArchiveRestore, Trash2 } from 'lucide-react';

interface ArchivedTask {
  id: number | string;
  name: string;
  due_date: string;
}

interface ArchivedTasksDrawerProps {
  archivedTasks?: ArchivedTask[];
  onRestore: (taskId: ArchivedTask['id']) => void;
  onDelete: (taskId: ArchivedTask['id']) => void;
  onClearAll: () => void;
}

// const SAMPLE_ARCHIVED_TASKS: ArchivedTask[] = [
//   {
//     id: 1,
//     name: "Update documentation",
//     dueDate: "2024-03-15",
//   },
//   {
//     id: 2,
//     name: "Review pull requests",
//     dueDate: "2024-03-20",
//   },
//   {
//     id: 3,
//     name: "Fix navigation bug",
//     dueDate: "2024-03-25",
//   }
// ];

const ArchivedTasksDrawer: React.FC<ArchivedTasksDrawerProps> = ({
  archivedTasks,
  onRestore,
  onDelete,
  onClearAll,
}) => {
  console.log(archivedTasks, 'archivedTasks');
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="fixed bottom-4 right-4 gap-2">
          <ArchiveRestore size={16} />
          Archived Tasks
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className=" max-h-[70%] w-full sm:w-[355px] rounded-t-xl border-t-2 ml-auto right-4"
      >
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Archived Tasks</SheetTitle>
            {archivedTasks && archivedTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-[250px] overflow-y-auto h-[calc(100%-4rem)]">
          <table className="w-full ">
            <thead className=" sticky top-0 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Task Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Due Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {archivedTasks && archivedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No archived tasks found
                  </td>
                </tr>
              ) : (
                archivedTasks &&
                archivedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-500 rounded-sm bg-none"
                  >
                    <td className="px-4 py-3 text-sm text-white">
                      {task.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {task.due_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRestore(task.id)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(task.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArchivedTasksDrawer;
