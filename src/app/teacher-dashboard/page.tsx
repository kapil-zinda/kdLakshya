'use client';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import TeacherDashboardCards from '@/components/dashboard/TeacherDashboardCards';

export default function TeacherDashboardPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'faculty', 'admin']}>
      {(userData) => <TeacherDashboardCards userData={userData} />}
    </DashboardWrapper>
  );
}
