import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Priority = 'low' | 'medium' | 'high' | 'all';

interface Task {
  id: number;
  name: string;
  task: string;
  priority: Exclude<Priority, 'all'>;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'John', task: 'Review Q3 sales report', priority: 'medium' },
    { id: 2, name: 'Sarah', task: 'Prepare presentation slides', priority: 'high' },
    { id: 3, name: 'Mike', task: 'Update client database', priority: 'low' },
    { id: 4, name: 'Emma', task: 'Schedule team meeting', priority: 'medium' },
  ]);

  const [filter, setFilter] = useState<Priority>('all');

  const handlePriorityChange = (taskId: number, newPriority: Exclude<Priority, 'all'>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, priority: newPriority } : task
    ));
  };

  const priorityColors: Record<Exclude<Priority, 'all'>, string> = {
    low: 'bg-green-200 text-green-800',
    medium: 'bg-yellow-200 text-yellow-800',
    high: 'bg-red-200 text-red-800',
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.priority === filter);

  return (
    <div className="bg-gray-600 p-4 rounded-lg">
      <h2 className="font-bold mb-2 text-[22px] text-white">BY CATEGORY</h2>
      <div className="mb-4">
        <Select onValueChange={(value: Priority) => setFilter(value)}>
          <SelectTrigger className="w-[200px] bg-white text-gray-800">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2 text-sm md:text-base">
        {filteredTasks.map((task) => (
            // style={{background: priorityColors[task.priority]}}
          <li key={task.id} className="flex items-center justify-between text-white">
            <span>{task.name}: {task.task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;