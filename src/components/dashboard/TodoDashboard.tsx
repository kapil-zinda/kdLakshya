"use client"
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import TaskList from './PriorityTable';
import CategoryList from './CategoryTable';
import StatusList from './StatusTable';
import NotesComponent from './NotesComponent';

interface PriorityData {
  name: string;
  value: number;
  color: string;
}

interface CategoryData {
  name: string;
  value: number;
}

const TodoDashboard: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const priorityData: PriorityData[] = [
    { name: 'High', value: 4, color: '#ff6b6b' },
    { name: 'Medium', value: 3, color: '#feca57' },
    { name: 'Low', value: 2, color: '#48dbfb' },
    { name: 'None', value: 1, color: '#c8d6e5' },
  ];

  const categoryData: CategoryData[] = [
    { name: 'Work Projects', value: 30 },
    { name: 'Personal', value: 20 },
    { name: 'Errands', value: 15 },
    { name: 'Health & Fitness', value: 10 },
    { name: 'Learning', value: 15 },
    { name: 'Finance', value: 10 },
  ];

  return (
    <div className="bg-gray-800  p-4 md:p-6 font-sans rounded-3xl w-[100%]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Header */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
          <h1 className="text-xl md:text-2xl font-bold">DASHBOARD</h1>
          <p>Task Tracker</p>
        </div>
        <div className="bg-green-500 p-4 rounded-lg hidden sm:block" >
            <h2 className="font-bold text-sm md:text-base">TODAY'S DATE</h2>
            <p className="text-lg md:text-xl">{currentDate}</p>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-1 md:col-span-3 lg:col-span-4">
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">TOTAL TASKS</h2>
            <p className="text-xl md:text-2xl">18</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">TODAY'S TASKS</h2>
            <p className="text-xl md:text-2xl">3</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">OVERDUE TASKS</h2>
            <p className="text-xl md:text-2xl">1</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">COMPLETED</h2>
            <p className="text-xl md:text-2xl">5</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-1 md:col-span-4 lg:col-span-4 ">
          <TaskList />
          <CategoryList />
          <StatusList />
          <div className="col-span-1 space-y-4">
          <div className="bg-cyan-700 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-sm md:text-base">TASKS BY EACH PRIORITY</h2>
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-orange-600 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-sm md:text-base">TODAY'S TASKS</h2>
            <ul className="list-disc list-inside text-sm md:text-base">
              <li>Call accountant to clarify tax questions</li>
              <li>Finish report for team meeting</li>
              <li>Buy groceries for dinner party</li>
            </ul>
          </div>
        </div>
        </div>
        <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2 text-sm md:text-base">TASKS BY EACH STATUS</h2>
          <ul className="text-sm md:text-base">
            <li>October 7, 2023: Quarterly business review</li>
            <li>October 12, 2023: Dentist appointment</li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2 bg-yellow-800 p-4 rounded-lg">
          <h2 className="font-bold mb-2 text-sm md:text-base">TASKS BY EACH CATEGORY / PROJECT</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
       
        {/* <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2 text-sm md:text-base">NOTES</h2>
          <ul className="text-sm md:text-base">
            <li>October 7, 2023: Quarterly business review</li>
            <li>October 12, 2023: Dentist appointment</li>
          </ul>
        </div> */}
        <NotesComponent/>

        <div className="col-span-1 md:col-span-2 bg-yellow-800 p-4 rounded-lg">
        <div className="bg-yellow-800 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-sm md:text-base">CREATE TASK / MOTIVATION QUOTE</h2>
            <button className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-4">
              Create New Task
            </button>
            <p className="italic text-sm md:text-base">
              "The secret of getting ahead is getting started." - Mark Twain
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TodoDashboard;