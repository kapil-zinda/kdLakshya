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
import { DataTableRowNeed } from './data-table-row-need';
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
  status: 'todo' | 'in process' | 'done';
  priority: 'low' | 'medium' | 'high';
  importance: 'important' | 'not important';
  due_date: string; // Format: "MM/DD/YY"
  category: 'exercise' | 'study' | 'food';
  start_date?: string; // Optional, only present in some tasks
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
// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
// }
export const columns: ColumnDef<TodoTask>[] = [
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => <DataTableRowTitle row={row.original.name} />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <DataTableRowStatus row={row.original.status} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => <DataTableRowPriority row={row.original.priority} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => <DataTableRowNeed row={row.original.category} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export function DataTable() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [todoData, setTodoData] = React.useState<TodoData>({});
  const [datas, setDatas] = React.useState<TodoTask[] | []>(todoData.tasks);
  const table = useReactTable({
    datas,
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

  const [archivedTasks, setArchivedTasks] = React.useState<ArchivedTask[]>([]);
  const fetchData = async () => {
    try {
      const result = await makeApiCall({
        path: `subject/todo`,
        method: 'GET',
      });
      setTodoData(result.data.attributes);
      setArchivedTasks(result.data.attributes?.archived);
    } catch (error) {
      console.log(error);
    }
  };
  React.useEffect(() => {
    fetchData();
  }, []);
  const handleDeleteArchived = async (id: ArchivedTask['id']) => {
    try {
      const result = await makeApiCall({
        path: `subject/todo?todo_ids=${id}`,
        method: 'DELETE',
      });
      console.log(result);
      setArchivedTasks((prevData: ArchivedTask[]) =>
        prevData.filter((item: ArchivedTask) => item.id !== id),
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handleAllClearArchived = async () => {
    try {
      const result = await makeApiCall({
        path: `subject/todo`,
        method: 'DELETE',
      });
      console.log(result, 'rishbah ');
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };
  const handleRestoreArchived = async (id: ArchivedTask['id']) => {
    try {
      const result = await makeApiCall({
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
      console.log(result, 'result');
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };
  {
    console.log(table, 'hello');
  }
  return (
    <div className="space-y-4">
      <AddTask todoData={todoData} setTodoData={setTodoData} />
      {/* <DataTableToolbar table={table} /> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
