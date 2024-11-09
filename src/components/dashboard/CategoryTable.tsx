import React, { useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Category = 'all' | string;

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

interface CategoryListProps {
  datas: TodoTask[];
  allowed_category: string[];
}

const CategoryList: React.FC<CategoryListProps> = ({
  datas,
  allowed_category,
}) => {
  const [filter, setFilter] = useState<Category>('all');

  const filteredTasks =
    filter === 'all' ? datas : datas.filter((task) => task.category === filter);

  return (
    <div className="bg-gray-600 p-4 rounded-lg">
      <div className="mb-4 flex">
        <h2 className="font-bold mb-2 text-[22px] text-white mr-[auto]">
          BY CATEGORY
        </h2>
        <Select onValueChange={(value: Category) => setFilter(value)}>
          <SelectTrigger className="w-[100px] bg-white text-gray-800">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {allowed_category.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
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
              {task.name}: {task.due_date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
