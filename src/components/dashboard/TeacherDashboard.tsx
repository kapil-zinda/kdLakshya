'use client';

import React, { useEffect, useState } from 'react';

import { UserData } from '@/app/interfaces/userInterface';
import {
  chartColors,
  dummyAttendanceChartData,
  dummyDashboardStats,
  dummyPerformanceChartData,
} from '@/data/teacherDashboardDummyData';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import AcademicTasks from './AcademicTasks';
import AttendanceManagement from './AttendanceManagement';
import MarkSheet from './MarkSheet';
import ResultsTracking from './ResultsTracking';

interface TeacherDashboardProps {
  userData: UserData;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [statistics, setStatistics] = useState(dummyDashboardStats);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get current date in DD/MM/YY format
  const today = new Date();
  const currentDate = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getFullYear()).slice(-2),
  ].join('/');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Fetch teacher profile data
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const tokenData = localStorage.getItem('bearerToken');
        if (!tokenData) {
          console.warn('No bearer token found');
          return;
        }

        const parsed = JSON.parse(tokenData);
        const BaseURLAuth =
          process.env.NEXT_PUBLIC_BaseURLAuth ||
          'https://apis.testkdlakshya.uchhal.in/auth';

        const response = await fetch(
          `${BaseURLAuth}/users/me?include=permission`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${parsed.value}`,
              'Content-Type': 'application/vnd.api+json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Teacher users/me response:', data);

          if (data.data) {
            const userApiData = data.data;
            const attrs = userApiData.attributes;

            const updatedTeacherData = {
              id: userApiData.id,
              email: attrs.email,
              firstName: attrs.first_name || attrs.name?.split(' ')[0] || '',
              lastName:
                attrs.last_name ||
                attrs.name?.split(' ').slice(1).join(' ') ||
                '',
              phone: attrs.phone,
              designation: attrs.designation,
              experience: attrs.experience,
              profilePhoto: attrs.profile_photo || attrs.photo || '',
              type: attrs.type,
              role: attrs.role,
            };

            setTeacherData(updatedTeacherData);
            setProfilePhoto(updatedTeacherData.profilePhoto);

            console.log('Updated teacher data from API:', updatedTeacherData);
            console.log('Profile photo URL:', updatedTeacherData.profilePhoto);
          }
        } else {
          console.error('Failed to fetch teacher profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching teacher profile:', error);
      }
    };

    fetchTeacherProfile();
  }, []);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      if (!teacherData?.id) {
        throw new Error('Teacher ID not found');
      }

      const tokenData = localStorage.getItem('bearerToken');
      if (!tokenData) {
        throw new Error('No bearer token found');
      }
      const parsed = JSON.parse(tokenData);

      console.log('Getting S3 signed URL...');
      const BaseURL =
        process.env.NEXT_PUBLIC_BaseURL ||
        'https://apis.testkdlakshya.uchhal.in';

      const signedUrlResponse = await fetch(
        `${BaseURL}/workspace/s3/signed-url`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parsed.value}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'upload',
            id: teacherData.id,
            attributes: {
              title: 'profile_photo',
              role: 'faculty',
            },
          }),
        },
      );

      if (!signedUrlResponse.ok) {
        throw new Error(
          `Failed to get signed URL: ${signedUrlResponse.status}`,
        );
      }

      const signedData = await signedUrlResponse.json();
      console.log('S3 signed URL response:', signedData);

      const signedUrl = signedData.data.signed_url;
      const filePath = signedData.data.file_path;
      const bucket = signedData.data.bucket || 'workspace-test-org-data-v1';

      console.log('Uploading to S3...', signedUrl);
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      const region = 'ap-south-1';
      const photoUrl = `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;

      console.log('Photo uploaded successfully. URL:', photoUrl);
      setProfilePhoto(photoUrl);

      const updatedTeacherData = {
        ...teacherData,
        profilePhoto: photoUrl,
      };
      setTeacherData(updatedTeacherData);
      setShowPhotoModal(false);

      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="bg-gray-800 p-4 md:p-6 font-sans rounded-3xl w-full">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-400 border-b border-gray-700">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'attendance'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Attendance
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('marksheet')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'marksheet'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Mark Sheet
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'results'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Results
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'tasks'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Academic Tasks
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('profile')}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'profile'
                  ? 'text-blue-500 bg-gray-700 active'
                  : 'hover:text-gray-300 hover:bg-gray-700'
              }`}
            >
              Profile
            </button>
          </li>
        </ul>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
              <h1 className="text-xl md:text-2xl font-bold">
                TEACHER DASHBOARD
              </h1>
              <p>Classroom Management System</p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg hidden sm:block">
              <h2 className="font-bold text-sm md:text-base">
                TODAY&apos;S DATE
              </h2>
              <p className="text-lg md:text-xl">{currentDate}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">TOTAL STUDENTS</h2>
              <p className="text-xl md:text-2xl">{statistics.totalStudents}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">PRESENT TODAY</h2>
              <p className="text-xl md:text-2xl">{statistics.presentToday}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">ABSENT TODAY</h2>
              <p className="text-xl md:text-2xl">{statistics.absentToday}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">PENDING TASKS</h2>
              <p className="text-xl md:text-2xl">{statistics.pendingTasks}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Attendance Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dummyAttendanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {dummyAttendanceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Student Performance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dummyPerformanceChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {dummyPerformanceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('attendance')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Take Attendance
              </button>
              <button
                onClick={() => setActiveTab('marksheet')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Update Marks
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
              >
                View Results
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Manage Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Management Tab */}
      {activeTab === 'attendance' && <AttendanceManagement />}

      {/* Mark Sheet Tab */}
      {activeTab === 'marksheet' && <MarkSheet />}

      {/* Results Tracking Tab */}
      {activeTab === 'results' && <ResultsTracking />}

      {/* Academic Tasks Tab */}
      {activeTab === 'tasks' && <AcademicTasks />}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            Teacher Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Photo Section */}
            <div className="md:col-span-1">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Profile Photo
                </h3>
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => {
                            console.error(
                              'Failed to load profile photo:',
                              profilePhoto,
                            );
                            setProfilePhoto('');
                          }}
                        />
                      ) : (
                        <svg
                          className="w-20 h-20 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Teacher Information Section */}
            <div className="md:col-span-2">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Personal Information
                </h3>
                {teacherData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Name
                      </label>
                      <p className="text-white">
                        {teacherData.firstName} {teacherData.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Email
                      </label>
                      <p className="text-white">{teacherData.email}</p>
                    </div>
                    {teacherData.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Phone
                        </label>
                        <p className="text-white">{teacherData.phone}</p>
                      </div>
                    )}
                    {teacherData.designation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Designation
                        </label>
                        <p className="text-white">{teacherData.designation}</p>
                      </div>
                    )}
                    {teacherData.experience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Experience
                        </label>
                        <p className="text-white">
                          {teacherData.experience} years
                        </p>
                      </div>
                    )}
                    {teacherData.type && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Type
                        </label>
                        <p className="text-white capitalize">
                          {teacherData.type}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400">
                    Loading profile information...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
