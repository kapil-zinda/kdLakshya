'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react';

import CreateUserPopUp from '../modal/CreareNewUser';
import { DeleteUserPopup } from '../modal/DeleteUserPopUp';
import { UpdateUserPopUp } from '../modal/EditUserPopup';

export type Team = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
};

const data: Team[] = [
  {
    id: 1,
    name: 'John Doe',
    description: 'john.doe@gmail.com',
    status: 'active',
    createdAt: '2024-07-01T10:15:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    description: 'jane.smith@yahoo.com',
    status: 'inactive',
    createdAt: '2024-07-02T12:30:00Z',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    description: 'mike.johnson@outlook.com',
    status: 'inactive',
    createdAt: '2024-07-03T14:45:00Z',
  },
  {
    id: 4,
    name: 'Emily Davis',
    description: 'emily.davis@gmail.com',
    status: 'active',
    createdAt: '2024-07-04T16:00:00Z',
  },
  {
    id: 5,
    name: 'Chris Brown',
    description: 'chris.brown@hotmail.com',
    status: 'inactive',
    createdAt: '2024-07-05T09:20:00Z',
  },
  {
    id: 6,
    name: 'Sarah Wilson',
    description: 'sarah.wilson@yahoo.com',
    status: 'active',
    createdAt: '2024-07-06T11:10:00Z',
  },
  {
    id: 7,
    name: 'David Miller',
    description: 'david.miller@gmail.com',
    status: 'inactive',
    createdAt: '2024-07-07T15:30:00Z',
  },
  {
    id: 8,
    name: 'Laura Martin',
    description: 'laura.martin@outlook.com',
    status: 'inactive',
    createdAt: '2024-07-08T13:45:00Z',
  },
  {
    id: 9,
    name: 'James Anderson',
    description: 'james.anderson@hotmail.com',
    status: 'active',
    createdAt: '2024-07-09T17:00:00Z',
  },
  {
    id: 10,
    name: 'Megan Taylor',
    description: 'megan.taylor@gmail.com',
    status: 'inactive',
    createdAt: '2024-07-10T18:15:00Z',
  },
  {
    id: 11,
    name: 'Robert Lee',
    description: 'robert.lee@yahoo.com',
    status: 'active',
    createdAt: '2024-07-11T08:00:00Z',
  },
  {
    id: 12,
    name: 'Linda Walker',
    description: 'linda.walker@gmail.com',
    status: 'inactive',
    createdAt: '2024-07-12T19:25:00Z',
  },
  {
    id: 13,
    name: 'Kevin Harris',
    description: 'kevin.harris@outlook.com',
    status: 'active',
    createdAt: '2024-07-13T10:50:00Z',
  },
  {
    id: 14,
    name: 'Olivia Scott',
    description: 'olivia.scott@hotmail.com',
    status: 'inactive',
    createdAt: '2024-07-14T13:35:00Z',
  },
  {
    id: 15,
    name: 'Ethan White',
    description: 'ethan.white@gmail.com',
    status: 'active',
    createdAt: '2024-07-15T14:40:00Z',
  },
  {
    id: 16,
    name: 'Sophia Hall',
    description: 'sophia.hall@yahoo.com',
    status: 'inactive',
    createdAt: '2024-07-16T16:10:00Z',
  },
  {
    id: 17,
    name: 'Daniel Allen',
    description: 'daniel.allen@outlook.com',
    status: 'inactive',
    createdAt: '2024-07-17T11:20:00Z',
  },
  {
    id: 18,
    name: 'Ava Young',
    description: 'ava.young@gmail.com',
    status: 'active',
    createdAt: '2024-07-18T15:00:00Z',
  },
  {
    id: 19,
    name: 'Matthew King',
    description: 'matthew.king@hotmail.com',
    status: 'inactive',
    createdAt: '2024-07-19T09:45:00Z',
  },
  {
    id: 20,
    name: 'Isabella Wright',
    description: 'isabella.wright@yahoo.com',
    status: 'active',
    createdAt: '2024-07-20T12:15:00Z',
  },
  {
    id: 21,
    name: 'Joseph Green',
    description: 'joseph.green@gmail.com',
    status: 'inactive',
    createdAt: '2024-07-21T14:30:00Z',
  },
  {
    id: 22,
    name: 'Mia Adams',
    description: 'mia.adams@outlook.com',
    status: 'inactive',
    createdAt: '2024-07-22T13:55:00Z',
  },
  {
    id: 23,
    name: 'William Nelson',
    description: 'william.nelson@gmail.com',
    status: 'active',
    createdAt: '2024-07-23T18:10:00Z',
  },
  {
    id: 24,
    name: 'Charlotte Baker',
    description: 'charlotte.baker@hotmail.com',
    status: 'inactive',
    createdAt: '2024-07-24T10:20:00Z',
  },
  {
    id: 25,
    name: 'Alexander Carter',
    description: 'alexander.carter@yahoo.com',
    status: 'inactive',
    createdAt: '2024-07-25T11:50:00Z',
  },
  {
    id: 26,
    name: 'Amelia Mitchell',
    description: 'amelia.mitchell@gmail.com',
    status: 'active',
    createdAt: '2024-07-26T14:05:00Z',
  },
  {
    id: 27,
    name: 'Elijah Perez',
    description: 'elijah.perez@outlook.com',
    status: 'inactive',
    createdAt: '2024-07-27T15:25:00Z',
  },
  {
    id: 28,
    name: 'Grace Roberts',
    description: 'grace.roberts@gmail.com',
    status: 'active',
    createdAt: '2024-07-28T17:45:00Z',
  },
  {
    id: 29,
    name: 'Henry Evans',
    description: 'henry.evans@yahoo.com',
    status: 'inactive',
    createdAt: '2024-07-29T16:00:00Z',
  },
  {
    id: 30,
    name: 'Ella Turner',
    description: 'ella.turner@gmail.com',
    status: 'inactive',
    createdAt: '2024-07-30T12:40:00Z',
  },
  {
    id: 31,
    name: 'Jack Collins',
    description: 'jack.collins@hotmail.com',
    status: 'active',
    createdAt: '2024-07-31T11:15:00Z',
  },
  {
    id: 32,
    name: 'Scarlett Stewart',
    description: 'scarlett.stewart@gmail.com',
    status: 'inactive',
    createdAt: '2024-08-01T13:10:00Z',
  },
  {
    id: 33,
    name: 'Sebastian Morris',
    description: 'sebastian.morris@outlook.com',
    status: 'inactive',
    createdAt: '2024-08-02T14:55:00Z',
  },
  {
    id: 34,
    name: 'Zoe Cooper',
    description: 'zoe.cooper@yahoo.com',
    status: 'active',
    createdAt: '2024-08-03T16:20:00Z',
  },
  {
    id: 35,
    name: 'Luke Richardson',
    description: 'luke.richardson@gmail.com',
    status: 'inactive',
    createdAt: '2024-08-04T18:30:00Z',
  },
  {
    id: 36,
    name: 'Harper Sanchez',
    description: 'harper.sanchez@outlook.com',
    status: 'inactive',
    createdAt: '2024-08-05T09:40:00Z',
  },
  {
    id: 37,
    name: 'Leo Ramirez',
    description: 'leo.ramirez@gmail.com',
    status: 'active',
    createdAt: '2024-08-06T15:05:00Z',
  },
  {
    id: 38,
    name: 'Chloe Barnes',
    description: 'chloe.barnes@yahoo.com',
    status: 'inactive',
    createdAt: '2024-08-07T13:35:00Z',
  },
  {
    id: 39,
    name: 'Nathan Ross',
    description: 'nathan.ross@hotmail.com',
    status: 'active',
    createdAt: '2024-08-08T11:50:00Z',
  },
  {
    id: 40,
    name: 'Mila Brooks',
    description: 'mila.brooks@gmail.com',
    status: 'inactive',
    createdAt: '2024-08-09T17:30:00Z',
  },
  {
    id: 41,
    name: 'Connor Bell',
    description: 'connor.bell@outlook.com',
    status: 'inactive',
    createdAt: '2024-08-10T15:40:00Z',
  },
  {
    id: 42,
    name: 'Layla Coleman',
    description: 'layla.coleman@gmail.com',
    status: 'active',
    createdAt: '2024-08-11T14:20:00Z',
  },
  {
    id: 43,
    name: 'Aaron Jenkins',
    description: 'aaron.jenkins@yahoo.com',
    status: 'inactive',
    createdAt: '2024-08-12T16:50:00Z',
  },
  {
    id: 44,
    name: 'Hannah Perry',
    description: 'hannah.perry@gmail.com',
    status: 'inactive',
    createdAt: '2024-08-13T18:10:00Z',
  },
  {
    id: 45,
    name: 'Mason Powell',
    description: 'mason.powell@hotmail.com',
    status: 'active',
    createdAt: '2024-08-14',
  },
];

// export const columns: ColumnDef<User>[] = [
//   {
//     accessorKey: "name",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Name
//         </Button>
//       )
//     },
//     cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
//   },

//   {
//     accessorKey: "email",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//         >
//           Email
//         </Button>
//       )
//     },
//     cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <div className="capitalize">{row.getValue("status")}</div>
//     ),
//   },

//   {
//     accessorKey: "createdAt",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//         >
//           Dated Added
//         </Button>
//       )
//     },
//     cell: ({ row }) => <div className="lowercase">{row.getValue("createdAt")}</div>,
//   },
//   {
//     id: "actions",
//     enableHiding: false,
//     cell: ({ row }) => {
//       const payment = row.original

//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" className="h-8 w-8 p-0">
//               <span className="sr-only">Open menu</span>
//               <MoreHorizontal className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem>Disable User</DropdownMenuItem>
//             <DropdownMenuItem>Edit User</DropdownMenuItem>
//             <DropdownMenuItem>Delete User</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>

//       )
//     },
//   },
// ]
export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.original.name}</div>, // Access name directly from row.original
  },

  {
    accessorKey: 'description',
    header: ({ column }) => {
      return <Button variant="ghost">Description</Button>;
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.original.description}</div>
    ), // Access email directly from row.original
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="capitalize">{row.original.status}</div> // Access status directly from row.original
    ),
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return <Button variant="ghost">Date Added</Button>;
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.original.createdAt}</div>
    ), // Access createdAt directly from row.original
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      const [openDeletePopup, setOpenDeletePopup] = React.useState(false);
      const [openEditPopup, setOpenEditPopup] = React.useState(false);

      const handleDeleteUserClick = () => {
        setOpenDeletePopup(true);
      };

      const handleCloseDeletePopup = () => {
        setOpenDeletePopup(false);
      };

      const handleDeleteUser = (user: Team) => {
        console.log('Deleting user:', user);
        // Perform your delete logic here
      };

      const handleEditUserClick = () => {
        setOpenEditPopup(true);
      };

      const handleCloseEditPopup = () => {
        setOpenEditPopup(false);
      };

      const handleUpdateStateUserClick = (status: string) => {
        const updatedStatus = status === 'active' ? 'inactive' : 'active';

        // Make an API call to update the user's status
        console.log(`User status updated to: ${updatedStatus}`);
        // You can implement an API call here to update the user status in your backend
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleUpdateStateUserClick(row.original.status)}
              >
                {row.original.status === 'active'
                  ? 'Disable Team'
                  : 'Activate Team'}
              </DropdownMenuItem>
              {row.original.status === 'active' && (
                <DropdownMenuItem onClick={handleEditUserClick}>
                  Edit Team
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDeleteUserClick}>
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {openDeletePopup && (
            <DeleteUserPopup
              user={user}
              open={openDeletePopup}
              onClose={handleCloseDeletePopup}
              onDelete={() => handleDeleteUser(user)}
            />
          )}
        </>
      );
    },
  },
];

export function TeamsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // const onDisableUser = (userId: number) => {
  //   setData((prevData) =>
  //     prevData.map((user) =>
  //       user.id === userId ? { ...user, status: "inactive" } : user
  //     )
  //   )
  // }

  // const onEditUser = (userId: number) => {
  //   // Logic to edit user details (e.g., open a modal with user data)
  //   console.log("Edit user with ID:", userId)
  // }

  // const onDeleteUser = (userId: number) => {
  //   setData((prevData) => prevData.filter((user) => user.id !== userId))
  // }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {/* <Button variant="outline" className="mr-auto">
              + New User 
            </Button> */}
        {/* <CreateUserPopUp /> */}
        {/* <Input
          placeholder="Search Team..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        {/* <Button variant="outline" style={{margin: "0 5px"}}><Search/></Button> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
          {/* <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
                
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody> */}
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
