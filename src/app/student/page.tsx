'use client';

import React, { useEffect, useState } from 'react';

import { UserData, userData } from '@/app/interfaces/userInterface';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const StudentDashboardPage = () => {
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
          <StudentDashboard userData={userDatas} />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

export default StudentDashboardPage;
