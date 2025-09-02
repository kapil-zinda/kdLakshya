'use client';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <DashboardWrapper allowedRoles={['student', 'admin']}>
      {(userData) => <StudentDashboard userData={userData} />}
    </DashboardWrapper>
  );
}
