'use client';

import * as React from 'react';

import ArchivedTasksDrawer from '@/components/todo/ArchivedTasksDrawer';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { makeApiCall } from '@/utils/ApiRequest';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import { DataTablePagination } from '../components/data-table-pagination';
import { AddTask } from './add-task';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { DataTableRowCategory } from './data-table-row-category';
import { DataTableRowPriority } from './data-table-row-priority';
import { DataTableRowStatus } from './data-table-row-status';
import { DataTableRowTitle } from './data-table-row-title';

interface ArchivedTask {
  id: number | string;
  name: string;
  due_date: string;
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

export function DataTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

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

  const columns: ColumnDef<TodoTask>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <DataTableRowTitle row={row} updateTask={updateTask} />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <DataTableRowStatus
          row={row}
          updateTask={updateTask}
          allowedStatus={todoData.allowed_status}
        />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => (
        <DataTableRowPriority
          row={row}
          updateTask={updateTask}
          allowedPriority={todoData.allowed_priority}
        />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <DataTableRowCategory
          row={row}
          updateTask={updateTask}
          allowedCategory={todoData.allowed_category}
        />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          deleteTask={deleteTask}
          duplicateTask={duplicateTask}
          editTask={updateTask}
        />
      ),
    },
  ];

  const deleteTask = async (id: number | string) => {
    try {
      await makeApiCall({
        path: `subject/todo/${id}`,
        method: 'DELETE',
      });
      setTodoData((prevData) => {
        const updatedTasks = prevData.tasks.filter((task) => task.id !== id);
        const archivedTask = prevData.tasks.find((task) => task.id === id);

        // Add the task to archived only if it exists
        const updatedArchived = archivedTask
          ? [...prevData.archived, archivedTask]
          : prevData.archived;

        setArchivedTasks(updatedArchived);

        const updatedTotalTasksCompleted = prevData.total_tasks_completed + 1;

        return {
          ...prevData,
          tasks: updatedTasks,
          archived: updatedArchived,
          total_tasks_completed: updatedTotalTasksCompleted,
        };
      });

      // Update the tasks state to reflect the current tasks
      setDatas((prevDatas) => prevDatas.filter((task) => task.id !== id));
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  const duplicateTask = async (data: TodoTask) => {
    try {
      const payload = {
        data: {
          type: 'todo',
          attributes: {
            name: data.name,
            due_date: data.due_date,
            status: data.status,
            priority: data.priority,
            category: data.category,
            importance: 'important',
            start_date: data.due_date,
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

  const [todoData, setTodoData] = React.useState<TodoData>({
    ...initialTodoData,
  });
  const [datas, setDatas] = React.useState<TodoTask[]>(todoData.tasks || []);

  const table = useReactTable({
    data: datas,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const fetchData = async () => {
    try {
      const result = await makeApiCall({
        path: `subject/todo`,
        method: 'GET',
      });
      setTodoData(result.data.attributes);
      setDatas(result.data.attributes.tasks);
      setArchivedTasks(result.data.attributes.archived);
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

  const [archivedTasks, setArchivedTasks] = React.useState<ArchivedTask[]>([]);

  const handleDeleteArchived = async (id: ArchivedTask['id']) => {
    try {
      await makeApiCall({
        path: `subject/todo?todo_ids=${id}`,
        method: 'DELETE',
      });
      setArchivedTasks((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAllClearArchived = async () => {
    try {
      await makeApiCall({
        path: `subject/todo`,
        method: 'DELETE',
      });
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRestoreArchived = async (id: ArchivedTask['id']) => {
    try {
      await makeApiCall({
        path: `subject/todo`,
        method: 'PATCH',
        payload: {
          data: {
            type: 'todo',
            attributes: {
              active: [id],
            },
          },
        },
      });
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-4">
      <AddTask
        todoData={todoData}
        setTodoData={setTodoData}
        setDatas={setDatas}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        updateTask,
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <ArchivedTasksDrawer
        onClearAll={handleAllClearArchived}
        onRestore={handleRestoreArchived}
        onDelete={handleDeleteArchived}
        archivedTasks={archivedTasks}
      />
    </div>
  );
}
