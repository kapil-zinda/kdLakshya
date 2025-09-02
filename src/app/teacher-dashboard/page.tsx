'use client';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

export default function TeacherDashboardPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'admin']}>
      {(userData) => <TeacherDashboard userData={userData} />}
    </DashboardWrapper>
  );
}
