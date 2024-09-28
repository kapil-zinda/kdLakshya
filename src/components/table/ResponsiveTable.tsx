import Image from "next/image"
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type User = {
    name: string
    status: "active" | "inactive"
    email: string
    createdAt: string
  }

const data: User[] = [
    {
      name: "John Doe",
      email: "john.doe@gmail.com",
      status: "active",
      createdAt: "2024-07-01T10:15:00Z",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@yahoo.com",
      status: "inactive",
      createdAt: "2024-07-02T12:30:00Z",
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@outlook.com",
      status: "inactive",
      createdAt: "2024-07-03T14:45:00Z",
    },
    {
      name: "Emily Davis",
      email: "emily.davis@gmail.com",
      status: "active",
      createdAt: "2024-07-04T16:00:00Z",
    },
    {
      name: "Chris Brown",
      email: "chris.brown@hotmail.com",
      status: "inactive",
      createdAt: "2024-07-05T09:20:00Z",
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@yahoo.com",
      status: "active",
      createdAt: "2024-07-06T11:10:00Z",
    },
    {
      name: "David Miller",
      email: "david.miller@gmail.com",
      status: "inactive",
      createdAt: "2024-07-07T15:30:00Z",
    },
    {
      name: "Laura Martin",
      email: "laura.martin@outlook.com",
      status: "inactive",
      createdAt: "2024-07-08T13:45:00Z",
    },
    {
      name: "James Anderson",
      email: "james.anderson@hotmail.com",
      status: "active",
      createdAt: "2024-07-09T17:00:00Z",
    },
    {
      name: "Megan Taylor",
      email: "megan.taylor@gmail.com",
      status: "inactive",
      createdAt: "2024-07-10T18:15:00Z",
    },
    {
      name: "Robert Lee",
      email: "robert.lee@yahoo.com",
      status: "active",
      createdAt: "2024-07-11T08:00:00Z",
    },
    {
      name: "Linda Walker",
      email: "linda.walker@gmail.com",
      status: "inactive",
      createdAt: "2024-07-12T19:25:00Z",
    },
    {
      name: "Kevin Harris",
      email: "kevin.harris@outlook.com",
      status: "active",
      createdAt: "2024-07-13T10:50:00Z",
    },
    {
      name: "Olivia Scott",
      email: "olivia.scott@hotmail.com",
      status: "inactive",
      createdAt: "2024-07-14T13:35:00Z",
    },
    {
      name: "Ethan White",
      email: "ethan.white@gmail.com",
      status: "active",
      createdAt: "2024-07-15T14:40:00Z",
    },
    {
      name: "Sophia Hall",
      email: "sophia.hall@yahoo.com",
      status: "inactive",
      createdAt: "2024-07-16T16:10:00Z",
    },
    {
      name: "Daniel Allen",
      email: "daniel.allen@outlook.com",
      status: "inactive",
      createdAt: "2024-07-17T11:20:00Z",
    },
    {
      name: "Ava Young",
      email: "ava.young@gmail.com",
      status: "active",
      createdAt: "2024-07-18T15:00:00Z",
    },
    {
      name: "Matthew King",
      email: "matthew.king@hotmail.com",
      status: "inactive",
      createdAt: "2024-07-19T09:45:00Z",
    },
    {
      name: "Isabella Wright",
      email: "isabella.wright@yahoo.com",
      status: "active",
      createdAt: "2024-07-20T12:15:00Z",
    },
    {
      name: "Joseph Green",
      email: "joseph.green@gmail.com",
      status: "inactive",
      createdAt: "2024-07-21T14:30:00Z",
    },
    {
      name: "Mia Adams",
      email: "mia.adams@outlook.com",
      status: "inactive",
      createdAt: "2024-07-22T13:55:00Z",
    },
    {
      name: "William Nelson",
      email: "william.nelson@gmail.com",
      status: "active",
      createdAt: "2024-07-23T18:10:00Z",
    },
    {
      name: "Charlotte Baker",
      email: "charlotte.baker@hotmail.com",
      status: "inactive",
      createdAt: "2024-07-24T10:20:00Z",
    },
    {
      name: "Alexander Carter",
      email: "alexander.carter@yahoo.com",
      status: "inactive",
      createdAt: "2024-07-25T11:50:00Z",
    },
    {
      name: "Amelia Mitchell",
      email: "amelia.mitchell@gmail.com",
      status: "active",
      createdAt: "2024-07-26T14:05:00Z",
    },
    {
      name: "Elijah Perez",
      email: "elijah.perez@outlook.com",
      status: "inactive",
      createdAt: "2024-07-27T15:25:00Z",
    },
    {
      name: "Grace Roberts",
      email: "grace.roberts@gmail.com",
      status: "active",
      createdAt: "2024-07-28T17:45:00Z",
    },
    {
      name: "Henry Evans",
      email: "henry.evans@yahoo.com",
      status: "inactive",
      createdAt: "2024-07-29T16:00:00Z",
    },
    {
      name: "Ella Turner",
      email: "ella.turner@gmail.com",
      status: "inactive",
      createdAt: "2024-07-30T12:40:00Z",
    },
    {
      name: "Jack Collins",
      email: "jack.collins@hotmail.com",
      status: "active",
      createdAt: "2024-07-31T11:15:00Z",
    },
    {
      name: "Scarlett Stewart",
      email: "scarlett.stewart@gmail.com",
      status: "inactive",
      createdAt: "2024-08-01T13:10:00Z",
    },
    {
      name: "Sebastian Morris",
      email: "sebastian.morris@outlook.com",
      status: "inactive",
      createdAt: "2024-08-02T14:55:00Z",
    },
    {
      name: "Zoe Cooper",
      email: "zoe.cooper@yahoo.com",
      status: "active",
      createdAt: "2024-08-03T16:20:00Z",
    },
    {
      name: "Luke Richardson",
      email: "luke.richardson@gmail.com",
      status: "inactive",
      createdAt: "2024-08-04T18:30:00Z",
    },
    {
      name: "Harper Sanchez",
      email: "harper.sanchez@outlook.com",
      status: "inactive",
      createdAt: "2024-08-05T09:40:00Z",
    },
    {
      name: "Leo Ramirez",
      email: "leo.ramirez@gmail.com",
      status: "active",
      createdAt: "2024-08-06T15:05:00Z",
    },
    {
      name: "Chloe Barnes",
      email: "chloe.barnes@yahoo.com",
      status: "inactive",
      createdAt: "2024-08-07T11:30:00Z",
    },
    {
      name: "Benjamin Clark",
      email: "benjamin.clark@hotmail.com",
      status: "active",
      createdAt: "2024-08-08T13:15:00Z",
    },
    {
      name: "Avery Bell",
      email: "avery.bell@gmail.com",
      status: "inactive",
      createdAt: "2024-08-09T16:50:00Z",
    },
  ];
  

export const description =
  "An products dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. It displays a list of products in a table with actions."

export function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
         <TooltipProvider> <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip> </TooltipProvider>
         <TooltipProvider> <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Orders</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Orders</TooltipContent>
          </Tooltip></TooltipProvider>
         <TooltipProvider> <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Package className="h-5 w-5" />
                <span className="sr-only">Products</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Products</TooltipContent>
          </Tooltip></TooltipProvider>
         <TooltipProvider> <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Users2 className="h-5 w-5" />
                <span className="sr-only">Customers</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Customers</TooltipContent>
          </Tooltip></TooltipProvider>
          <TooltipProvider><Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LineChart className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Analytics</TooltipContent>
          </Tooltip></TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your products and view their sales performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>


                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created at</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="hidden sm:table-cell">
                        <Image
                            alt="Product image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={item.image}
                            width="64"
                        />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{item.createdAt}</TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>

                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong>{" "}
                    products
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
