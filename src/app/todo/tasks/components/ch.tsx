import React, { useState } from 'react';

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
import { toast } from '@/components/ui/use-toast';
import { useTask } from '@/context/task-context';
import { makeApiCall } from '@/utils/ApiRequest';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs, { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { categories } from '../data/data';

const FormSchema = z.object({
  title: z.string().min(2, {
    message: 'Write task title (ex: Geo lecture)',
  }),
  label: z.string().min(2, {
    message: 'Select Label (ex: watch)',
  }),
  status: z.string().min(2, {
    message: 'Task Status (ex: todo)',
  }),
  priority: z.string().min(2, {
    message: 'Task Priority (ex: important)',
  }),
  category: z.string().min(2, {
    message: 'Task Need (ex: Urgent)',
  }),
});

export function AddTaskForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      title: '',
      status: '',
      priority: '',
      category: '',
    },
  });

  const { addTask } = useTask();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categoriesLocal, setCategoriesLocal] = useState(categories);

  const handleAddCategory = async () => {
    try {
      // Call API to add the new category
      await makeApiCall({
        path: '/categories', // API endpoint for adding a category
        method: 'POST',
        payload: { name: newCategory },
      });

      // Update categories locally after successful API call
      const updatedCategories = [
        ...categoriesLocal,
        { value: newCategory, label: newCategory },
      ];
      setCategoriesLocal(updatedCategories);
      setIsAddingCategory(false);
      setNewCategory('');
    } catch (error) {
      console.log('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryToDelete: any) => {
    try {
      // Call API to delete the category
      await makeApiCall({
        path: `/categories/${categoryToDelete.value}`, // API endpoint for deleting a category
        method: 'DELETE',
      });

      // Update categories locally after successful API call
      const updatedCategories = categoriesLocal.filter(
        (category) => category.value !== categoryToDelete.value,
      );
      setCategoriesLocal(updatedCategories);
    } catch (error) {
      console.log('Error deleting category:', error);
    }
  };

  const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17'));
  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('DD/MM/YYYY') : '';
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addTask(data);
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block p-3 md:flex gap-2 md:gap-10 justify-end items-end"
      >
        {/* Rest of the form fields */}
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
                  {categoriesLocal.map((category: any, index: number) => (
                    <SelectItem key={index} value={category.value}>
                      <div className="flex justify-center items-center gap-3">
                        <category.icon /> {category.label}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="edit"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    Edit Category
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Task</Button>
      </form>

      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Edit Categories</h2>
            <div className="space-y-4">
              {categoriesLocal.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <category.icon />
                    <span>{category.label}</span>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={handleAddCategory}>Add</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsAddingCategory(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Form>
  );
}
