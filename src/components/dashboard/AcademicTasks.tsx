'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  dummyAcademicTasks,
  dummyCategoryOptions,
  dummyPriorityOptions,
  dummyStatusOptions,
} from '@/data/teacherDashboardDummyData';

interface AcademicTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  category: string;
}

const AcademicTasks: React.FC = () => {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AcademicTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New task form state
  const [showNewTaskForm, setShowNewTaskForm] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<Partial<AcademicTask>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    category: 'homework',
  });

  useEffect(() => {
    // Fetch tasks
    const fetchTasks = async () => {
      setIsLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setTasks(dummyAcademicTasks);
        setFilteredTasks(dummyAcademicTasks);
        setIsLoading(false);
      }, 500);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = tasks;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter((task) => task.category === categoryFilter);
    }

    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // This would be replaced with actual API call
      // const result = await makeApiCall({
      //   path: 'teacher/tasks',
      //   method: 'POST',
      //   payload: {
      //     data: {
      //       type: 'tasks',
      //       attributes: newTask
      //     }
      //   }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add new task to the list with a generated ID
      const newTaskWithId: AcademicTask = {
        ...(newTask as AcademicTask),
        id: Date.now().toString(),
      };

      setTasks([...tasks, newTaskWithId]);

      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        category: 'homework',
      });

      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: 'pending' | 'in-progress' | 'completed',
  ) => {
    setIsLoading(true);

    try {
      // This would be replaced with actual API call
      // await makeApiCall({
      //   path: `teacher/tasks/${taskId}`,
      //   method: 'PATCH',
      //   payload: {
      //     data: {
      //       type: 'tasks',
      //       id: taskId,
      //       attributes: {
      //         status: newStatus
      //       }
      //     }
      //   }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update task in the list
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsLoading(true);

    try {
      // This would be replaced with actual API call
      // await makeApiCall({
      //   path: `teacher/tasks/${taskId}`,
      //   method: 'DELETE'
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Remove task from the list
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Academic Tasks</h2>
        <Button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showNewTaskForm ? 'Cancel' : 'Add New Task'}
        </Button>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Add New Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="title" className="text-white mb-2 block">
                Title*
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Task title"
                required
              />
            </div>
            <div>
              <Label htmlFor="due-date" className="text-white mb-2 block">
                Due Date*
              </Label>
              <Input
                id="due-date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-white mb-2 block">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    priority: value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="text-white mb-2 block">
                Category
              </Label>
              <Select
                value={newTask.category}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="grading">Grading</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-white mb-2 block">
                Description
              </Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Task description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleAddTask}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Label htmlFor="search-input" className="text-white mb-2 block">
            Search Tasks
          </Label>
          <Input
            id="search-input"
            type="text"
            placeholder="Search by title or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="status-filter" className="text-white mb-2 block">
            Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {dummyStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority-filter" className="text-white mb-2 block">
            Priority
          </Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              {dummyPriorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category-filter" className="text-white mb-2 block">
            Category
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {dummyCategoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      {isLoading ? (
        <div className="text-center py-8 text-white">Loading tasks...</div>
      ) : filteredTasks.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Title</TableHead>
                <TableHead className="text-white">Due Date</TableHead>
                <TableHead className="text-white">Priority</TableHead>
                <TableHead className="text-white">Category</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-sm text-gray-400">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{task.dueDate}</TableCell>
                  <TableCell
                    className={`font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </TableCell>
                  <TableCell className="text-white">
                    {task.category.charAt(0).toUpperCase() +
                      task.category.slice(1)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusBadgeColor(task.status)}`}
                    >
                      {task.status.charAt(0).toUpperCase() +
                        task.status.slice(1).replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleUpdateTaskStatus(
                            task.id,
                            value as 'pending' | 'in-progress' | 'completed',
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleDeleteTask(task.id)}
                        className="bg-red-600 hover:bg-red-700 h-8 w-8 p-0"
                        size="sm"
                      >
                        X
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-white">No tasks found</div>
      )}
    </div>
  );
};

export default AcademicTasks;
