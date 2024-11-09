'use client';

import React from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import CategoryList from './CategoryTable';
import NotesComponent from './NotesComponent';
import TaskList from './PriorityTable';
import StatusList from './StatusTable';
import TaskEditModal from './TaskEditModel';

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

// Define props for custom shapes
interface TriangleBarProps {
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const getPath = (
  x: number,
  y: number,
  width: number,
  height: number,
): string => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};

const TriangleBar: React.FC<TriangleBarProps> = (props) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

interface PriorityData {
  name: string;
  value: number;
  color: string;
}

interface CategoryData {
  name: string;
  value: number;
}

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

interface TodoData {
  tasks: TodoTask[];
  archived: TodoTask[];
  note: string[];
  user_id: string;
  total_tasks_completed: number;
  total_tasks: number;
  allowed_status: string[];
  allowed_priority: string[];
  allowed_category: string[];
  allowed_importance: string[];
  id: string;
}

const TodoDashboard: React.FC = () => {
  const initialTodoData: TodoData = {
    tasks: [],
    archived: [],
    note: [],
    user_id: '',
    total_tasks_completed: 0,
    total_tasks: 0,
    allowed_status: [],
    allowed_priority: [],
    allowed_category: [],
    allowed_importance: [],
    id: '',
  };
  const [todoData, setTodoData] = React.useState<TodoData>({
    ...initialTodoData,
  });
  const [datas, setDatas] = React.useState<TodoTask[]>(todoData.tasks || []);
  const today = new Date();
  const formattedToday = [
    String(today.getDate()).padStart(2, '0'), // Day
    String(today.getMonth() + 1).padStart(2, '0'), // Month (0-based, so add 1)
    String(today.getFullYear()).slice(-2), // Year (last 2 digits)
  ].join('/');

  const [todayTasksCount, setTodayTasksCount] = React.useState<number>(0);
  const [overdueTasksCount, setOverdueTasksCount] = React.useState<number>(0);
  const [todayTasks, setTodayTasks] = React.useState<TodoTask[] | null>(null);

  const fetchData = async () => {
    try {
      const result = await makeApiCall({
        path: `subject/todo`,
        method: 'GET',
      });
      const data = result.data.attributes;
      setTodoData(data);
      setDatas(data.tasks);

      const priorityCounts: { [key: string]: number } = {};
      data.tasks.forEach((task: TodoTask) => {
        priorityCounts[task.priority] =
          (priorityCounts[task.priority] || 0) + 1;
      });

      const formattedPriorityData = data.allowed_priority.map(
        (priority: string) => ({
          name: priority,
          value: priorityCounts[priority] || 0,
          color:
            colors[data.allowed_priority.indexOf(priority) % colors.length],
        }),
      );

      setPriorityData(formattedPriorityData);

      const statusCounts: { [key: string]: number } = {};
      data.tasks.forEach((task: TodoTask) => {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      });

      const formattedStatusData = data.allowed_status.map((status: string) => ({
        name: status,
        value: statusCounts[status] || 0,
        color: colors[data.allowed_status.indexOf(status) % colors.length],
      }));

      setStatusData(formattedStatusData);

      const categoryCounts: { [key: string]: number } = {};
      data.tasks.forEach((task: TodoTask) => {
        categoryCounts[task.category] =
          (categoryCounts[task.category] || 0) + 1;
      });

      const formattedCategoryData = data.allowed_category.map(
        (category: string) => ({
          name: category,
          value: categoryCounts[category] || 0,
        }),
      );

      setCategoryData(formattedCategoryData);

      // Count tasks due today
      const todayTasks = data.tasks.filter(
        (task: TodoTask) => String(task.due_date) === String(formattedToday),
      );
      setTodayTasks(todayTasks);
      setTodayTasksCount(todayTasks.length);

      const todayNum = new Date();
      todayNum.setHours(0, 0, 0, 0);

      const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(2000 + year, month - 1, day);
      };

      const overdueTasks = data.tasks.filter((task: TodoTask) => {
        const dueDate = parseDate(task.due_date);
        return dueDate < todayNum;
      });

      setOverdueTasksCount(overdueTasks.length);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const updateTask = async (
    id: number | string,
    updatedData: Partial<TodoTask>,
  ) => {
    try {
      // Create the complete updated task object
      const completeUpdatedTask = todoData.tasks.find((task) => task.id === id)
        ? { ...todoData.tasks.find((task) => task.id === id), ...updatedData }
        : { ...updatedData };

      delete completeUpdatedTask.id;
      delete completeUpdatedTask.start_date;

      // Make API call with the complete updated task, minus `id` and `start_date`
      await makeApiCall({
        path: `subject/todo/${id}`,
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: completeUpdatedTask,
          },
        },
      });

      // Update the `todoData` and `datas` states to reflect changes
      setTodoData((prevData) => {
        const updatedTasks = prevData.tasks.map((task) =>
          task.id === id ? { ...task, ...updatedData } : task,
        );
        return { ...prevData, tasks: updatedTasks };
      });

      setDatas((prevDatas) =>
        prevDatas.map((task) =>
          task.id === id ? { ...task, ...updatedData } : task,
        ),
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const [priorityData, setPriorityData] = React.useState<PriorityData[]>([]);
  const [statusData, setStatusData] = React.useState<PriorityData[]>([]);
  const [categoryData, setCategoryData] = React.useState<CategoryData[]>([]);
  const [activePriorityIndex, setActivePriorityIndex] = React.useState<
    number | null
  >(null);
  const [activeStatusIndex, setActiveStatusIndex] = React.useState<
    number | null
  >(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#000',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          <p>{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [selectedTask, setSelectedTask] = React.useState<TodoTask | null>(null);

  return (
    <div className="bg-gray-800  p-4 md:p-6 font-sans rounded-3xl w-[100%]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Header */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
          <h1 className="text-xl md:text-2xl font-bold">DASHBOARD</h1>
          <p>Task Tracker</p>
        </div>
        <div className="bg-green-500 p-4 rounded-lg hidden sm:block">
          <h2 className="font-bold text-sm md:text-base">TODAY&apos;S DATE</h2>
          <p className="text-lg md:text-xl">{currentDate}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-1 md:col-span-3 lg:col-span-4">
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">TOTAL TASKS</h2>
            <p className="text-xl md:text-2xl">
              {todoData ? todoData.total_tasks : 0}
            </p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">
              TODAY&apos;S TASKS
            </h2>
            <p className="text-xl md:text-2xl">{todayTasksCount}</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">OVERDUE TASKS</h2>
            <p className="text-xl md:text-2xl">{overdueTasksCount}</p>
          </div>
          <div className="bg-blue-500 p-4 rounded-lg">
            <h2 className="font-bold text-sm md:text-base">COMPLETED</h2>
            <p className="text-xl md:text-2xl">
              {todoData ? todoData.total_tasks_completed : 0}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 col-span-1 md:col-span-4 lg:col-span-4 ">
          <TaskList
            datas={datas}
            allowed_priority={todoData.allowed_priority}
            setsectedtask={setSelectedTask}
            seteditmodelopen={setIsEditModalOpen}
          />
          <CategoryList
            datas={datas}
            allowed_category={todoData.allowed_category}
            setsectedtask={setSelectedTask}
            seteditmodelopen={setIsEditModalOpen}
          />
          <StatusList
            datas={datas}
            allowed_status={todoData.allowed_status}
            setsectedtask={setSelectedTask}
            seteditmodelopen={setIsEditModalOpen}
          />
          <div className="col-span-1 space-y-4">
            <div className="bg-cyan-700 p-4 rounded-lg">
              <h2 className="font-bold mb-2 text-sm md:text-base">
                TASKS BY EACH PRIORITY
              </h2>
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
                    onClick={(index) => setActivePriorityIndex(index)}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        // Change the background and text color when active
                        style={{
                          cursor: 'pointer',
                          fill:
                            index === activePriorityIndex
                              ? '#000'
                              : entry.color,
                          color:
                            index === activePriorityIndex
                              ? '#fff'
                              : entry.color,
                        }}
                      />
                    ))}
                  </Pie>
                  {/* Tooltip */}
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-orange-600 p-4 rounded-lg">
              <h2 className="font-bold mb-2 text-sm md:text-base">
                TODAY&apos;S TASKS
              </h2>
              <ul className="list-disc list-inside text-sm md:text-base">
                {todayTasks ? (
                  todayTasks.map((task) => (
                    <li
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsEditModalOpen(true);
                      }}
                      className="cursor-pointer hover:text-gray-200"
                    >
                      {task.name}
                    </li>
                  ))
                ) : (
                  <p>No tasks due today</p>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2 text-sm md:text-base">
            TASKS BY EACH STATUS
          </h2>
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
                onClick={(index) => setActiveStatusIndex(index)}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    // Change the background and text color when active
                    style={{
                      cursor: 'pointer',
                      fill: index === activeStatusIndex ? '#000' : entry.color,
                      color: index === activeStatusIndex ? '#fff' : entry.color,
                    }}
                  />
                ))}
              </Pie>
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-1 md:col-span-2 bg-yellow-400 p-4 rounded-lg">
          <h2 className="font-bold mb-2 text-sm md:text-[20px] text-black">
            TASKS BY EACH CATEGORY / PROJECT
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              width={500}
              height={300}
              data={categoryData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar
                dataKey="value"
                fill="#8884d8"
                shape={(props: any) => <TriangleBar {...props} />} // Pass props to the TriangleBar
                label={{ position: 'top' }}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <NotesComponent notes={todoData.note} />

        <div className="col-span-1 md:col-span-2 bg-yellow-800 p-4 rounded-lg">
          <div className="bg-yellow-800 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-sm md:text-base">
              CREATE TASK / MOTIVATION QUOTE
            </h2>
            <button className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-4">
              Create New Task
            </button>
            <p className="italic text-sm md:text-base">
              &quot;The secret of getting ahead is getting started.&quot; - Mark
              Twain
            </p>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={updateTask}
          allowedFields={{
            allowed_priority: todoData.allowed_priority,
            allowed_status: todoData.allowed_status,
            allowed_category: todoData.allowed_category,
          }}
        />
      )}
    </div>
  );
};

export default TodoDashboard;
