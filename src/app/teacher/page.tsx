'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

/**
 * This route used to render a template/demo teacher dashboard wired to
 * hardcoded sample data with no backend calls and no auth check at all —
 * anyone could type /teacher into the address bar, "save" attendance or
 * grades, and have it vanish on refresh. The real, live-data teacher
 * dashboard lives at /teacher-dashboard, so this now just redirects there.
 */
export default function TeacherRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teacher-dashboard');
  }, [router]);

  return null;
}
