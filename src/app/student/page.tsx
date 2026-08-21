'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

/**
 * This route used to render a template/demo student dashboard wired to
 * hardcoded sample data (userData from userInterface.ts) with no auth check
 * at all — anyone could type /student into the address bar and see a fully
 * rendered "logged-in" dashboard with invented attendance/grades. The real,
 * live-data student dashboard lives at /student-dashboard, so this now just
 * redirects there, matching the same fix already applied to /teacher.
 */
export default function StudentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student-dashboard');
  }, [router]);

  return null;
}
