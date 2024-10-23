import React, { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = 'todo' | 'progress' | 'done' | 'all';

interface Task {
  id: number;
  name: string;
  task: string;
  status: Exclude<Status, 'all'>;
}

const StatusList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'John', task: 'Review Q3 sales report', status: 'todo' },
    {
      id: 2,
      name: 'Sarah',
      task: 'Prepare presentation slides',
      status: 'progress',
    },
    { id: 3, name: 'Mike', task: 'Update client database', status: 'done' },
    { id: 4, name: 'Emma', task: 'Schedule team meeting', status: 'todo' },
  ]);

  const [filter, setFilter] = useState<Status>('all');

  // const handleStatusChange = (taskId: number, newStatus: Exclude<Status, 'all'>) => {
  //   setTasks(tasks.map(task =>
  //     task.id === taskId ? { ...task, status: newStatus } : task
  //   ));
  // };

  // const priorityColors: Record<Exclude<Status, 'all'>, string> = {
  //   todo: 'bg-green-200 text-green-800',
  //   progress: 'bg-yellow-200 text-yellow-800',
  //   done: 'bg-red-200 text-red-800',
  // };

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
  return (
    <div className="bg-gray-600 p-4 rounded-lg">
      <div className="mb-4 flex">
        <h2 className="font-bold mb-2 text-[22px] text-white mr-[auto]">
          BY STATUS
        </h2>
        <Select onValueChange={(value: Status) => setFilter(value)}>
          <SelectTrigger className="w-[100px] bg-white text-gray-800">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">TODO</SelectItem>
            <SelectItem value="progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2 text-sm md:text-base">
        {filteredTasks.map((task) => (
          // style={{background: priorityColors[task.priority]}}
          <li
            key={task.id}
            className="flex items-center justify-between text-white"
          >
            <span
              style={{
                width: '100%',
                borderRadius: '6px',
                padding: '4px 6px',
                margin: '3px 0',
                background: '#757575',
              }}
            >
              {task.name}: {task.task}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusList;
