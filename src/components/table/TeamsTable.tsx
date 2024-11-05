'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { makeApiCall } from '@/utils/ApiRequest';
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
import { MoreHorizontal, Search } from 'lucide-react';

import CreateUserGroupPopUp from '../modal/CreateUserGroupPopUp';
import DeleteUserGroupPopup from '../modal/DeleteUserGroupPopup';
import EditUserGroupPopup from '../modal/EditUserGroupPopup';

interface TeamPermission {
  [email: string]: string; // Key is an email, value is the permission level (e.g., "manage")
}

type TeamAttributes = {
  name: string;
  description: string;
  created_ts: number;
  modified_ts: number;
  is_active: boolean;
  permission: TeamPermission;
  key_id: string;
  org: string;
  id: string;
};

type TeamData = {
  type: string;
  id: string;
  attributes: TeamAttributes;
  links?: {
    self?: string;
  };
};

export function TeamsTable() {
  const [data, setTeamDatas] = useState<TeamData[]>([]); // Initialize state with an empty array
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false);
  const [openEditPopup, setOpenEditPopup] = React.useState(false);
  const columns: ColumnDef<TeamData>[] = [
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
      cell: ({ row }) => (
        <div className="lowercase">{row.original.attributes.name}</div>
      ),
    },

    {
      accessorKey: 'description',
      header: () => {
        return <Button variant="ghost">Description</Button>;
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.original.attributes.description}</div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.attributes.is_active ? 'active' : 'inactive'}
        </div> // Access status directly from row.original
      ),
    },

    {
      accessorKey: 'created_ts',
      header: () => {
        return <Button variant="ghost">Date Added</Button>;
      },
      cell: ({ row }) => (
        <div className="lowercase">
          {Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          }).format(row.original.attributes.created_ts)}
        </div>
      ), // Access createdAt directly from row.original
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const team = row.original;

        const handleDeleteTeamClick = () => {
          setOpenDeletePopup(true);
        };

        const handleCloseDeletePopup = () => {
          setOpenDeletePopup(false);
        };

        const handleDeleteTeam = async (team: TeamData) => {
          await makeApiCall({
            path: `auth/organizations/{org_id}/teams/${team.id}?permanent=true`,
            method: 'DELETE',
          });

          setTeamDatas((prevUsers) =>
            prevUsers.filter((u) => u.id !== team.id),
          );
        };

        const handleEditTeamClick = () => {
          setOpenEditPopup(true);
        };

        const handleCloseEditPopup = () => {
          setOpenEditPopup(false);
        };

        const handleUpdateStateTeamClick = async (status: string) => {
          const updatedStatus = status === 'active' ? false : true;

          // Make an API call to update the user's status
          console.log(`Team status updated to: ${updatedStatus}`);
          // You can implement an API call here to update the user status in your backend
          try {
            const Payload = {
              data: {
                type: 'teams',
                id: team.id,
                attributes: {
                  is_active: updatedStatus,
                },
              },
            };
            const result = await makeApiCall({
              path: `auth/organizations/{org_id}/teams/${team.id}`,
              method: 'PATCH',
              payload: Payload,
            });
            const updatedTeam = result.data;
            const updatedTeamDatas = data.map((u) =>
              u.id === updatedTeam.id ? { ...u, ...updatedTeam } : u,
            );
            // Update state with new user data
            setTeamDatas(updatedTeamDatas);
          } catch (error) {
            console.log(error);
          }
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
                  onClick={() =>
                    handleUpdateStateTeamClick(
                      row.original.attributes.is_active ? 'active' : 'inactive',
                    )
                  }
                >
                  {row.original.attributes.is_active === true
                    ? 'Disable Team'
                    : 'Activate Team'}
                </DropdownMenuItem>
                {row.original.attributes.is_active === true && (
                  <DropdownMenuItem onClick={handleEditTeamClick}>
                    Edit Team
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDeleteTeamClick}>
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {openDeletePopup && (
              <DeleteUserGroupPopup
                team={team}
                open={openDeletePopup}
                onClose={handleCloseDeletePopup}
                onDelete={() => handleDeleteTeam(team)}
              />
            )}
            {openEditPopup && (
              <EditUserGroupPopup
                open1={openEditPopup}
                onClose={handleCloseEditPopup}
                team={{
                  name: team.attributes.name,
                  description: team.attributes.description,
                  id: team.id,
                }}
                teamDatas={data}
                setTeamDatas={setTeamDatas}
              />
            )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await makeApiCall({
          path: `auth/organizations/{org_id}/teams`,
          method: 'GET',
        });
        setTeamDatas(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

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
        <CreateUserGroupPopUp setTeamDatas={setTeamDatas} />
        <Input
          placeholder="Search teams..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button variant="outline" style={{ margin: '0 5px' }}>
          <Search />
        </Button>
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
