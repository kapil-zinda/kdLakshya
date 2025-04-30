'use client';

import React, { useEffect, useState } from 'react';

import { UserData, userData } from '@/app/interfaces/userInterface';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

const TeacherDashboardPage = () => {
  const [userDatas, setUserDatas] = useState<UserData>(userData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user data is loaded
    if (userDatas.userId) {
      setIsLoading(false);
    }
  }, [userDatas]);

  return (
    <>
      {isLoading ? (
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
          <TeacherDashboard userData={userDatas} />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default TeacherDashboardPage;
