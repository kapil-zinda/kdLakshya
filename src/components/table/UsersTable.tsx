"use client"
import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CreateUserPopUp from "../modal/CreareNewUser"
import { DeleteUserPopup } from "../modal/DeleteUserPopUp"
import { UpdateUserPopUp } from "../modal/EditUserPopup"
import axios from "axios"
import { getItemWithTTL } from "@/utils/customLocalStorageWithTTL";


// export type User = {
//   user_id: number
//   first_name: string
//   last_name: string
//   is_active: boolean
//   email: string
//   created_ts: number
// }
type UserAttributes = {
  last_name: string;
  email: string;
  user_id: string;
  org: string;
  is_active: boolean;
  created_ts: number;
  first_name: string;
  id: string;
}

type User = {
  type: string;
  id: string;
  attributes: UserAttributes;
}

type UserData = {
  data: User[];
}


export function UsersTable() {



  const [data, setUserDatas] = useState<User[]>([]);  // Initialize state with an empty array
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.original.attributes.first_name + " " + row.original.attributes.last_name}</div>, // Access name directly from row.original
    },
    
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button variant="ghost">
            Email
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.original.attributes.email}</div>, // Access email directly from row.original
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.attributes.is_active ? "active" : "inactive"}</div> // Access status directly from row.original
      ),
    },
    
    {
      accessorKey: "created_ts",
      header: ({ column }) => {
        return (
          <Button variant="ghost">
            Date Added
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.original.attributes.created_ts}</div>, // Access createdAt directly from row.original
    },
    {
      id: "actions",
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
  
      const handleDeleteUser = async(user: User) => {
        const res = await axios.delete(`${BaseURLAuth}/users/${user.id}?permanent=true`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/vnd.api+json',
          }
        })
        const deletedUser = res.data.data;
        console.log('User deleted successfully:', deletedUser);
        if (user.id === user.id) {
          setUserDatas((prevUsers: User[]) => prevUsers.filter(u => u.id !== user.id));
        }
      };
  
      const handleEditUserClick = () => {
        setOpenEditPopup(true);
      };
  
      const handleCloseEditPopup = () => {
        setOpenEditPopup(false);
      };
  
      const handleUpdateStateUserClick = async(status: string) => {
        const updatedStatus = status === 'active' ? false : true;
    
        // Make an API call to update the user's status
        console.log(`User status updated to: ${updatedStatus}`);
        // You can implement an API call here to update the user status in your backend
        try {
          const res = await axios.patch(
              `${BaseURLAuth}/users/${user.id}`,
              {
                data: {
                  type: "users",
                  id: user.id,
                  attributes: {
                    active: updatedStatus
                  }
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${bearerToken}`,
                  'Content-Type': 'application/vnd.api+json',
                },
              }
            );
            const updatedUser = res.data.data;
            console.log("hero zinda hai...", updatedUser, data )
            const updatedUserDatas = data.map((u  : any) => 
              u.id === updatedUser.id ? { ...u, ...updatedUser } : u
            );
            console.log("updatedUserDatas", updatedUserDatas)
            // Update state with new user data
            setUserDatas(updatedUserDatas);
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
          <DropdownMenuItem onClick={() => handleUpdateStateUserClick(row.original.attributes.is_active?  'active' : 'inactive')}>
            {row.original.attributes.is_active === true ? 'Disable User' : 'Activate User'}
          </DropdownMenuItem>
          {row.original.attributes.is_active === true && (
            <DropdownMenuItem onClick={handleEditUserClick}>Edit User</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDeleteUserClick}>Delete User</DropdownMenuItem>
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
          {openEditPopup && (
            <UpdateUserPopUp
              open1={openEditPopup}
              onClose={handleCloseEditPopup}
              user={{
                email: user.attributes.email,
                firstName: user.attributes.first_name,
                lastName: user.attributes.last_name,
                id:  user.id,
              }}
              userDatas={data}
              setUserDatas={setUserDatas}
            />
          )}
         </>
        );
      },
    },
  ];


  const bearerToken = getItemWithTTL("bearerToken");  // Get your bearer token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BaseURLAuth}/users?page[size]=30`, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "application/vnd.api+json",
          },
        });
        setUserDatas(res.data.data);  // Update state with the user data
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const [sorting, setSorting] = React.useState<SortingState>([])
  
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
  })
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
            {/* <Button variant="outline" className="mr-auto">
              + New User 
            </Button> */}
            <CreateUserPopUp data={data} setUserDatas={setUserDatas}/>
        <Input
          placeholder="Search users..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button variant="outline" style={{margin: "0 5px"}}><Search/></Button>
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
                        header.getContext()
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
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
</TableBody>
      </Table>

      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
  )
}
