'use client';

import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path should render without sidebar
  const isAdminRoute = pathname?.startsWith('/admin-portal');
  const isTemplateRoute = pathname?.startsWith('/template');
  const isRootRoute = pathname === '/';
  const isStudentRoute = pathname === '/student';
  const isTeacherRoute = pathname === '/teacher';

  // For admin portal, template routes, root route, student and teacher routes, render children directly without sidebar
  if (
    isAdminRoute ||
    isTemplateRoute ||
    isRootRoute ||
    isStudentRoute ||
    isTeacherRoute
  ) {
    return <>{children}</>;
  }

  // For other routes, render children directly
  return <>{children}</>;
}
