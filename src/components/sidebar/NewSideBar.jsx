"use client";
import Link from "next/link"
import {
  Book,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Users,
} from "lucide-react"

import { useRouter } from "next/navigation";
import FunctionsIcon from '@mui/icons-material/Functions';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useState } from "react";
import { userData } from "@/app/interfaces/userInterface";

const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const AUTH0_logout_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URL || '';

export const description =
  "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action."

export function NewSideBar({ children }) {

  const [userDatas, setuserdatas] = useState(userData)
  useEffect(()=>{
    setuserdatas(userData)
  },[userData])
  console.log(userData)
  const logoutHandler = async () => {
    localStorage.removeItem("bearerToken");
    window.location.href = `https://${AUTH0_Domain_Name}/v2/logout?client_id=${AUTH0_Client_Id}&returnTo=${AUTH0_logout_redirect}`
    // try {
    //   const response = await axios.get('https://dev-p3hppyisuuaems5y.us.auth0.com/v2/logout', {
    //     params: {
    //       client_id: 'Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL',
    //       returnTo: 'https://test-10k-hours.uchhal.in/',
    //     },
    //   });
  
    //   // Redirect after a successful logout
    //   if (response.status === 200) {
    //     // Example redirect
    //     window.location.href = '/?hello=kapil';
    //   }
    // } catch (error) {
    //   console.error('Error during logout:', error);
    // }
  };
  
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("/");
  const handleTabClick = (href) => {
    setActiveTab(href);
  };
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">10K hours</span>
            </Link>
          </div>
          <div className="flex-1" id= "radheradhe">
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <Link
        href="/.."
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/.." ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/..")}
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/subject"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/subject" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/subject")}
      >
        <FunctionsIcon className="h-4 w-4" />
        Subject
      </Link>
      <Link
        href="/todo"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/todo" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/todo")}
      >
        <Package className="h-4 w-4" />
        TODO
      </Link>
      <Link
        href="/teams"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/teams" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/teams")}
      >
        <Users className="h-4 w-4" />
        Teams
      </Link>
      <Link
        href="/notes"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/notes" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/notes")}
      >
        <Book className="h-4 w-4" />
        Notes
      </Link>
      <Link
        href="/admin"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          activeTab === "/admin" ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => handleTabClick("/admin")}
      >
        <LineChart className="h-4 w-4" />
        Admin panel
      </Link>
    </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[200px]">
              {/* <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/.."
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">10K hours</span>
                </Link>
                <Link
                  href="/.."
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/subject"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Subject
                </Link>
                <Link
                  href="/todo"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  TODO
                </Link>
                <Link
                  href="/teams"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Teams
                </Link>
                <Link
                  href="/notes"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Notes
                </Link>
              </nav> */}
               <nav className="grid gap-2 text-lg font-medium">
      <Link
        href="/.."
        className={`flex items-center gap-2 text-lg font-semibold ${
          activeTab === "/.." ? "text-foreground" : "text-muted-foreground"
        }`}
        onClick={() => handleTabClick("/..")}
      >
        <Package2 className="h-6 w-6" />
        <span className="sr-only">10K hours</span>
      </Link>
      <Link
        href="/.."
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/.." ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/..")}
      >
        <Home className="h-5 w-5" />
        Dashboard
      </Link>
      <Link
        href="/subject"
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/subject" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/subject")}
      >
        <FunctionsIcon className="h-5 w-5" />
        Subject
      </Link>
      <Link
        href="/todo"
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/todo" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/todo")}
      >
        <Package className="h-5 w-5" />
        TODO
      </Link>
      <Link
        href="/teams"
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/teams" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/teams")}
      >
        <Users className="h-5 w-5" />
        Teams
      </Link>
      <Link
        href="/notes"
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/notes" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/notes")}
      >
        <Book className="h-5 w-5" />
        Notes
      </Link>
      <Link
        href="/admin"
        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
          activeTab === "/admin" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabClick("/admin")}
      >
        <LineChart className="h-5 w-5" />
        Admin panel
      </Link>
    </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">

          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem> Hi {userDatas?.firstName}</DropdownMenuItem>
              <DropdownMenuItem onClick={logoutHandler} > Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children} {/* Render children here */}
        </main>
        {/* <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
          </div>
          <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm" x-chunk="dashboard-02-chunk-1"
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no products
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start selling as soon as you add a product.
              </p>
              <Button className="mt-4">Add Product</Button>
            </div>
          </div>
        </main> */}
      </div>
    </div>
  )
}
