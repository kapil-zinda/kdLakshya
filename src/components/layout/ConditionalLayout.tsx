'use client';

import { usePathname } from 'next/navigation';

import { NewSideBar } from '@/components/sidebar/NewSideBar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path is admin portal
  const isAdminRoute = pathname?.startsWith('/admin-portal');
  const isTemplateRoute = pathname?.startsWith('/template');
  const isRootRoute = pathname === '/';

  // For admin portal, template routes, and root route, render children directly without sidebar
  if (isAdminRoute || isTemplateRoute || isRootRoute) {
    return <>{children}</>;
  }

  // For other routes, render with sidebar
  return (
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <main className="flex-1 p-4 lg:gap-6 lg:p-6">
          <NewSideBar>{children}</NewSideBar>
        </main>
      </div>
    </div>
  );
}
