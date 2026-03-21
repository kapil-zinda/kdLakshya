'use client';

import { usePathname } from 'next/navigation';

import { PravahaChat } from '@/components/PravahaChat';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path should render without sidebar
  const isAdminRoute = pathname?.startsWith('/admin-portal');
  const isTemplateRoute = pathname?.startsWith('/template');
  const isRootRoute = pathname === '/';
  const isAboutRoute = pathname === '/about';
  const isFacultiesRoute = pathname === '/faculties';
  const isGalleryRoute = pathname === '/gallery';
  const isContactRoute = pathname === '/contact';
  const isNotificationsRoute = pathname === '/notifications';
  const isStudentRoute = pathname === '/student';
  const isTeacherRoute = pathname === '/teacher';

  // For admin portal, template routes, main site routes, student and teacher routes, render children directly
  if (
    isAdminRoute ||
    isTemplateRoute ||
    isRootRoute ||
    isAboutRoute ||
    isFacultiesRoute ||
    isGalleryRoute ||
    isContactRoute ||
    isNotificationsRoute ||
    isStudentRoute ||
    isTeacherRoute
  ) {
    return (
      <>
        {children}
        <PravahaChat />
      </>
    );
  }

  // For other routes, render children directly
  return (
    <>
      {children}
      <PravahaChat />
    </>
  );
}
