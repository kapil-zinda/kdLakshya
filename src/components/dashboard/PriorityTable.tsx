import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Priority = 'low' | 'medium' | 'high' | 'all' | string;

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

interface TaskListProps {
  datas: TodoTask[];
  allowed_priority: string[];
  setsectedtask: Dispatch<SetStateAction<TodoTask | null>>;
  seteditmodelopen: Dispatch<SetStateAction<boolean>>;
}

const TaskList: React.FC<TaskListProps> = ({
  datas,
  allowed_priority,
  setsectedtask,
  seteditmodelopen,
}) => {
  const [filter, setFilter] = useState<Priority>('all');
  useEffect(() => {}, [datas]);

  // Priority-specific colors; other priorities will get default styles.
  const priorityColors: Record<string, string> = {
    low: 'bg-green-200 text-green-800',
    medium: 'bg-yellow-200 text-yellow-800',
    high: 'bg-red-200 text-red-800',
  };

  const filteredTasks =
    filter === 'all' ? datas : datas.filter((task) => task.priority === filter);

  return (
    <div className="bg-gray-600 p-4 rounded-lg">
      <div className="mb-4 flex">
        <h2 className="font-bold mb-2 text-[22px] text-white mr-[auto]">
          BY PRIORITY
        </h2>
        <Select onValueChange={(value: Priority) => setFilter(value)}>
          <SelectTrigger className="w-[100px] bg-white text-gray-800">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {allowed_priority.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2 text-sm md:text-base">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between text-white cursor-pointer hover:text-gray-200"
            onClick={() => {
              setsectedtask(task);
              seteditmodelopen(true);
            }}
          >
            <span
              className={priorityColors[task.priority] || 'bg-white text-black'}
              style={{
                width: '100%',
                borderRadius: '6px',
                padding: '4px 6px',
                margin: '3px 0',
              }}
            >
              {task.name}: {task.due_date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
