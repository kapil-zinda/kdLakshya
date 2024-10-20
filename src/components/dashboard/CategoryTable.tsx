import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Category = 'physics' | 'maths' | 'chemistery' | 'all';

interface Task {
  id: number;
  name: string;
  task: string;
  category: Exclude<Category, 'all'>;
}

const CategoryList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'John', task: 'Review Q3 sales report', category: 'maths' },
    { id: 2, name: 'Sarah', task: 'Prepare presentation slides', category: 'chemistery' },
    { id: 3, name: 'Mike', task: 'Update client database', category: 'physics' },
    { id: 4, name: 'Emma', task: 'Schedule team meeting', category: 'maths' },
  ]);

  const [filter, setFilter] = useState<Category>('all');

  const handleCategoryChange = (taskId: number, newCategory: Exclude<Category, 'all'>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, category: newCategory } : task
    ));
  };

  const priorityColors: Record<Exclude<Category, 'all'>, string> = {
    physics: 'bg-green-200 text-green-800',
    maths: 'bg-yellow-200 text-yellow-800',
    chemistery: 'bg-red-200 text-red-800',
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.category === filter);
  return (
    <div className="bg-gray-600 p-4 rounded-lg">
      <div className="mb-4 flex">
      <h2 className="font-bold mb-2 text-[22px] text-white mr-[auto]">BY CATEGORY</h2>
        <Select onValueChange={(value: Category) => setFilter(value)}>
          <SelectTrigger className="w-[100px] bg-white text-gray-800">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
            <SelectItem value="maths">Maths</SelectItem>
            <SelectItem value="chemistery">Chemistery</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-2 text-sm md:text-base">
        {filteredTasks.map((task) => (
            // style={{background: priorityColors[task.priority]}}
          <li key={task.id} className="flex items-center justify-between text-white">
            <span style={{width: "100%", borderRadius: "6px", padding: "4px 6px", margin: "3px 0", background: "#757575"}}>{task.name}: {task.task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;