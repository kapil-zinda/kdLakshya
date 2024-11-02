'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { labels, needs, priorities, statuses } from '../data/data';

const FormSchema = z.object({
  title: z.string().min(2, {
    message: 'Write task title (ex: Geo lecture) ',
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
  need: z.string().min(2, {
    message: 'Task Need (ex: Urgent)',
  }),
});

export function AddTask() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      title: '',
      status: '',
      priority: '',
      need: '',
    },
  });

  const { addTask } = useTask();

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
  const [selectedDate, setSelectedDate] = React.useState(null);

  // Handler function to update the state when a date is selected
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const [value, setValue] = React.useState<Dayjs | null>(dayjs('2022-04-17'));
  console.log(value, 'time');
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          name="label"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* <SelectLabel>Status</SelectLabel> */}
                  {labels.map((label: any, index: number) => (
                    <SelectItem key={index} value={label.value}>
                      {label.label}
                    </SelectItem>
                  ))}
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
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statuses.map((status: any, index: number) => (
                    <SelectItem key={index} value={status.value}>
                      <div className="flex justify-center items-center gap-3">
                        <status.icon /> {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectValue placeholder={`${value}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* <DateCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                   sx={{
                    backgroundColor: '#292929',
                    color: 'white', // Changes the text color to white
                    '.MuiTypography-root': {
                      color: 'white' // Applies to all typography (text) inside the calendar
                    },
                    '.MuiPickersDay-root': {
                      color: 'white' // Applies to individual day cells
                    }
                  }} /> */}

                    <DemoContainer components={['DateCalendar']}>
                      <DemoItem label="Controlled calendar">
                        <DateCalendar
                          value={value}
                          onChange={(newValue) => setValue(newValue)}
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
          name="need"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Need" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {needs.map((need: any, index: number) => (
                    <SelectItem key={index} value={need.value}>
                      <div className="flex justify-center items-center gap-3">
                        <need.icon /> {need.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Add Task</Button>
      </form>
    </Form>
  );
}
