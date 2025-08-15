'use client';

import { usePathname } from 'next/navigation';

import { NewSideBar } from '@/components/sidebar/NewSideBar';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path is admin portal
  const isAdminRoute = pathname.startsWith('/admin-portal');
  const isTemplateRoute = pathname.startsWith('/template');

  // For admin portal and template routes, render children directly without sidebar
  if (isAdminRoute || isTemplateRoute) {
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
