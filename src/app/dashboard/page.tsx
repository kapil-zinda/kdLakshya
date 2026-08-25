'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { canonicalDashboardPath } from '@/utils/authRoutes';

/**
 * /dashboard used to be the generic post-login redirect target every login
 * flow pushed to, and used to render its own full copy of each role's
 * dashboard (duplicating admin-portal/dashboard, teacher-dashboard, and
 * student-dashboard, each of which is independently maintained and can
 * drift out of sync - see the fake hardcoded student counts that shipped
 * here while admin-portal/dashboard already had real ones).
 *
 * It is no longer part of the *login* path - every login flow now redirects
 * straight to its canonical route once the role is known (see
 * providers.tsx and login/page.tsx). But it is very much still live,
 * general-purpose "take me to my dashboard, figure out whose" navigation:
 * the public site header's own Dashboard button (Header.tsx), seven
 * admin-portal pages' own dashboard links, and two of the auth hooks
 * (useAuth.ts, useAuthRedux.ts) all still point here deliberately, since
 * none of them know the current user's role up front the way a fresh login
 * does. This page is what resolves that: one extra hop, same as clicking
 * into any other route you don't already know the destination for.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserData['role'] | null>(null);

  useEffect(() => {
    if (role) {
      router.replace(canonicalDashboardPath(role));
    }
  }, [role, router]);

  return (
    <DashboardWrapper redirectTo="/">
      {(userData) => {
        if (userData.role !== role) {
          setRole(userData.role);
        }
        return null;
      }}
    </DashboardWrapper>
  );
}
