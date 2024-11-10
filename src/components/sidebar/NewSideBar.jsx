'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { userData } from '@/app/interfaces/userInterface';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';
import FunctionsIcon from '@mui/icons-material/Functions';
import {
  Book,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Users,
} from 'lucide-react';

const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const AUTH0_logout_redirect =
  process.env.NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URL || '';

export function NewSideBar({ children }) {
  const [userDatas, setUserDatas] = useState(userData);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('/');
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const bearerToken = getItemWithTTL('bearerToken');

  useEffect(() => {
    setIsClient(true);
    setUserDatas(userData);
  }, []);

  if (!isClient) return <div>Loading...</div>;

  const logoutHandler = async () => {
    localStorage.removeItem('bearerToken');
    window.location.href = `https://${AUTH0_Domain_Name}/v2/logout?client_id=${AUTH0_Client_Id}&returnTo=${AUTH0_logout_redirect}`;
  };

  const handleTabClick = (href) => {
    setActiveTab(href);
  };
  const sidebarLinks = [
    { href: '/..', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    {
      href: '/subject',
      icon: <FunctionsIcon className="h-5 w-5" />,
      label: 'Subject',
    },
    { href: '/todo', icon: <Package className="h-5 w-5" />, label: 'TODO' },
    userData.allowedTeams.length > 0
      ? { href: '/teams', icon: <Users className="h-5 w-5" />, label: 'Teams' }
      : undefined,
    { href: '/notes', icon: <Book className="h-5 w-5" />, label: 'Notes' },
    'org' in userData.permission
      ? {
          href: '/admin',
          icon: <LineChart className="h-5 w-5" />,
          label: 'Admin panel',
        }
      : undefined,
  ].filter(Boolean);

  if (pathname === '/' && bearerToken === null) {
    return children;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr]">
      <div
        className={`hidden border-r bg-muted/40 md:block transition-all duration-300 ease-in-out ${isHovered ? 'w-64' : 'w-16'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              {isHovered && <span className="">10K hours</span>}
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    activeTab === link.href
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => handleTabClick(link.href)}
                >
                  {link.icon}
                  {isHovered && <span>{link.label}</span>}
                </Link>
              ))}
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
              <nav className="grid gap-2 text-lg font-medium">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
                      activeTab === link.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleTabClick(link.href)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Hi {userDatas?.firstName}</DropdownMenuItem>
              <DropdownMenuItem onClick={logoutHandler}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
