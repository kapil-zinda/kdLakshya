import React, { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = 'done' | 'all' | string;

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

interface StatusListProps {
  datas: TodoTask[];
  allowed_status: string[];
}

const StatusList: React.FC<StatusListProps> = ({ datas, allowed_status }) => {
  const [filter, setFilter] = useState<Status>('all');

  const filteredTasks =
    filter === 'all' ? datas : datas.filter((task) => task.status === filter);
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
            {allowed_status.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2 text-sm md:text-base">
        {filteredTasks.map((task) => (
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
              {task.name}: {task.due_date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusList;
