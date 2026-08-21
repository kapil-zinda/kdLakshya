'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

/**
 * This route duplicated the student login form that already lives on
 * /login (the "Student Login Card", handleStudentLogin) - and nothing in
 * the app ever links here, so it was only reachable by typing the URL
 * directly. /login is the real, linked entry point (see
 * providers.tsx's redirect-to-/login-when-unauthenticated), so this now
 * just redirects there instead of running a second, unreferenced copy of
 * the same flow.
 */
export default function StudentLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
