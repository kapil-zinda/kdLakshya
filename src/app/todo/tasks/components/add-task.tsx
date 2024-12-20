'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { makeApiCall } from '@/utils/ApiRequest';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import dayjs, { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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

const FormSchema = z.object({
  title: z.string().min(2, {
    message: 'Write task title (ex: Geo lecture) ',
  }),
  label: z.string().min(2, {
    message: 'Select Due Date (ex: 10/10/2022)',
  }),
  dueDate: z.string().min(1, 'Please select a date'),
  status: z.string().min(2, {
    message: 'Task Status (ex: todo)',
  }),
  priority: z.string().min(2, {
    message: 'Task Priority (ex: important)',
  }),
  category: z.string().min(2, {
    message: 'Task Category (ex: Study)',
  }),
});

export function AddTask({
  todoData,
  setTodoData,
  setDatas,
}: {
  todoData: TodoData;
  setTodoData: Dispatch<SetStateAction<TodoData>>;
  setDatas: Dispatch<SetStateAction<TodoTask[]>>;
}) {
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return dayjs(date).format('DD/MM/YY');
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: formatDate(new Date()),
      title: '',
      status: '',
      priority: '',
      category: '',
      dueDate: formatDate(new Date()),
    },
  });

  const [categoriesLocal, setCategoriesLocal] = useState<string[]>(
    todoData?.allowed_category || [],
  );
  const [statusList, setStatusList] = useState(todoData?.allowed_status);
  const [priorityList, setPriorityList] = useState(todoData?.allowed_priority);
  useEffect(() => {
    setCategoriesLocal(todoData?.allowed_category);
    setStatusList(todoData?.allowed_status);
    setPriorityList(todoData?.allowed_priority);
  }, [todoData]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const handleAddCategory = async () => {
    try {
      const updatedCategories = [...categoriesLocal, newCategory];
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_category: updatedCategories,
            },
          },
        },
      });
      setCategoriesLocal(updatedCategories);
      setIsAddingCategory(false);
      setNewCategory('');
    } catch (error) {
      console.log('Error adding category:', error);
    }
  };
  const handleAddStatus = async () => {
    try {
      const updatedStatus = [...statusList, newStatus];
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_status: updatedStatus,
            },
          },
        },
      });
      setStatusList(updatedStatus);
      setIsAddingStatus(false);
      setNewStatus('');
    } catch (error) {
      console.log('Error adding status:', error);
    }
  };
  const handleAddPriority = async () => {
    try {
      const updatedPriorities = [...priorityList, newPriority];
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_priority: updatedPriorities,
            },
          },
        },
      });
      setPriorityList(updatedPriorities);
      setIsAddingPriority(false);
      setNewPriority('');
    } catch (error) {
      console.log('Error adding priority:', error);
    }
  };
  const handleDeleteCategory = async (categoryToDelete: string) => {
    try {
      const updatedCategories = categoriesLocal.filter(
        (category: string) => category !== categoryToDelete,
      );
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_category: updatedCategories,
            },
          },
        },
      });
      setCategoriesLocal(updatedCategories);
    } catch (error) {
      console.log('Error deleting category:', error);
    }
  };
  const handleDeletePriority = async (priorityToDelete: string) => {
    try {
      const updatedPriorities = priorityList.filter(
        (priority: string) => priority !== priorityToDelete,
      );
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_priority: updatedPriorities,
            },
          },
        },
      });
      setPriorityList(updatedPriorities);
    } catch (error) {
      console.log('Error deleting priority:', error);
    }
  };
  const handleDeleteStatus = async (statusToDelete: string) => {
    try {
      const updatedStatus = statusList.filter(
        (status: string) => status !== statusToDelete,
      );
      await makeApiCall({
        path: 'subject/todo',
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              allowed_status: updatedStatus,
            },
          },
        },
      });
      setStatusList(updatedStatus);
    } catch (error) {
      console.log('Error deleting status:', error);
    }
  };

  const [value, setValue] = React.useState<Dayjs | null>(dayjs());
  // const formatDate = (date: Dayjs | null) => {
  //   return date ? date.format('DD/MM/YYYY') : '';
  // };
  useEffect(() => {}, [todoData]);
  const handleSubmitTask = async (data: any) => {
    try {
      const payload = {
        data: {
          type: 'todo',
          attributes: {
            name: data.title,
            due_date: data.label,
            status: data.status,
            priority: data.priority,
            category: data.category,
            importance: 'important',
            start_date: data.label,
          },
        },
      };
      const result = await makeApiCall({
        path: 'subject/todo',
        method: 'POST',
        payload: payload,
      });
      setTodoData(result.data.attributes);
      setDatas(result.data.attributes.tasks);
    } catch (error) {
      console.log('Error adding category:', error);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitTask)}
        className="block p-3 md:flex gap-2 md:gap-10 justify-end items-end"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority*" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* <SelectLabel>Status</SelectLabel> */}
                  {priorityList &&
                    priorityList.map((priority: string, index: number) => (
                      <SelectItem key={index} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  <button value="" onClick={() => setIsAddingPriority(true)}>
                    <span className="flex items-center gap-2">
                      <PlusCircledIcon />
                      Edit Priority
                    </span>
                  </button>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status*" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusList &&
                    statusList.map((status: string, index: number) => (
                      <SelectItem key={index} value={status}>
                        <div className="flex justify-center items-center gap-3">
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  <button value="" onClick={() => setIsAddingStatus(true)}>
                    <span className="flex items-center gap-2">
                      <PlusCircledIcon />
                      Edit Status
                    </span>
                  </button>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    {/* <SelectValue placeholder={`${formatDate(value)}`} /> */}
                    <SelectValue placeholder="Select date">
                      {value ? formatDate(value.toDate()) : 'Select date'}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateCalendar']}>
                      <DemoItem label="Controlled calendar">
                        <DateCalendar
                          value={value}
                          // onChange={(newValue) => setValue(newValue)}
                          onChange={(newValue) => {
                            setValue(newValue);
                            field.onChange(formatDate(newValue));
                          }}
                          sx={{
                            backgroundColor: '#292929',
                            color: 'white', // Changes the text color to white
                            '.MuiTypography-root': {
                              color: 'white', // Applies to all typography (text) inside the calendar
                            },
                            '.MuiPickersDay-root': {
                              color: 'white', // Applies to individual day cells
                            },
                          }}
                        />
                      </DemoItem>
                    </DemoContainer>
                  </LocalizationProvider>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <div className="flex flex-col gap-2">
                    {categoriesLocal &&
                      categoriesLocal.map((category: string, index: number) => (
                        <SelectItem key={index} value={category}>
                          <div className="">{category}</div>
                        </SelectItem>
                      ))}
                    <button value="" onClick={() => setIsAddingCategory(true)}>
                      <span className="flex items-center gap-2">
                        <PlusCircledIcon />
                        Edit Category
                      </span>
                    </button>
                  </div>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          // onClick={() => handleSubmitTask(form.getValues())}
        >
          Add Task
        </Button>
      </form>
      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#585757] rounded-lg p-6 w-full max-w-md">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Categories</h2>
              <Button
                variant="ghost"
                onClick={() => setIsAddingCategory(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Categories List */}
            <div className="space-y-4">
              {categoriesLocal &&
                categoriesLocal.map(
                  (category: string, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span>{category}</span>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                )}

              {/* New Category Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddCategory}>Add</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAddingPriority && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#585757] rounded-lg p-6 w-full max-w-md">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Priorities</h2>
              <Button
                variant="ghost"
                onClick={() => setIsAddingPriority(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Priority List */}
            <div className="space-y-4">
              {priorityList &&
                priorityList.map(
                  (priority: string, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span>{priority}</span>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeletePriority(priority)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                )}

              {/* New Priority Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New priority name"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddPriority}>Add</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAddingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#585757] rounded-lg p-6 w-full max-w-md">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Status</h2>
              <Button
                variant="ghost"
                onClick={() => setIsAddingStatus(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* status List */}
            <div className="space-y-4">
              {statusList &&
                statusList.map(
                  (status: string, index: React.Key | null | undefined) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span>{status}</span>
                      </div>
                      {status != 'done' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteStatus(status)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  ),
                )}

              {/* New status Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New status name"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddStatus}>Add</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Form>
  );
}
