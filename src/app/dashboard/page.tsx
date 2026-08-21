'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';

const canonicalDashboardPath = (role: UserData['role']) => {
  if (role === 'admin') return '/admin-portal/dashboard';
  if (role === 'teacher') return '/teacher-dashboard';
  return '/student-dashboard';
};

/**
 * /dashboard is the generic post-login redirect target every login flow
 * pushes to - it used to render its own full copy of each role's dashboard
 * (duplicating admin-portal/dashboard, teacher-dashboard, and
 * student-dashboard, each of which is independently maintained and can
 * drift out of sync - see the fake hardcoded student counts that shipped
 * here while admin-portal/dashboard already had real ones). Now it just
 * forwards to the one canonical route per role.
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
