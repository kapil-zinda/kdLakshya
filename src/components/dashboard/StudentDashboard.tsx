'use client';

import React, { useState } from 'react';

import { UserData } from '@/app/interfaces/userInterface';
import {
  dummyStudentAttendance,
  dummyStudentDashboardStats,
  dummyStudentMarks,
} from '@/data/studentDashboardDummyData';

import StudentAttendance from './StudentAttendance';
import StudentCalendar from './StudentCalendar';
import StudentFees from './StudentFees';
import StudentMarks from './StudentMarks';
import StudentResults from './StudentResults';

interface StudentDashboardProps {
  userData: UserData;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userData }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get student data from localStorage
  const [studentData, setStudentData] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const storedStudentData = localStorage.getItem('studentAuth');
        if (!storedStudentData) {
          console.warn('No student data found in localStorage');
          return;
        }

        const parsed = JSON.parse(storedStudentData);
        setStudentData(parsed);

        // Fetch complete profile from /users/me API
        const BaseURLAuth =
          process.env.NEXT_PUBLIC_BaseURLAuth ||
          'https://apis.testkdlakshya.uchhal.in/auth';

        const response = await fetch(
          `${BaseURLAuth}/users/me?include=permission`,
          {
            method: 'GET',
            headers: {
              'x-api-key': parsed.basicAuthToken,
              'Content-Type': 'application/vnd.api+json',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Users/me response:', data);

          if (data.data) {
            const userData = data.data;
            const attrs = userData.attributes;

            // Update student data with complete profile info
            const updatedStudentData = {
              ...parsed,
              id: userData.id,
              email: attrs.email,
              firstName: attrs.first_name,
              lastName: attrs.last_name,
              phone: attrs.phone,
              rollNumber: attrs.roll_number,
              gradeLevel: attrs.grade_level,
              dateOfBirth: attrs.date_of_birth,
              profilePhoto:
                attrs.profile_photo || attrs.photo || parsed.profilePhoto || '',
              guardianInfo: attrs.guardian_info,
              status: attrs.status,
              admissionDate: attrs.admission_date,
            };

            // Save updated data
            localStorage.setItem(
              'studentAuth',
              JSON.stringify(updatedStudentData),
            );
            setStudentData(updatedStudentData);
            setProfilePhoto(updatedStudentData.profilePhoto);

            console.log('Updated student data from API:', updatedStudentData);
            console.log('Profile photo URL:', updatedStudentData.profilePhoto);
          }
        } else {
          console.error('Failed to fetch user profile:', response.status);
          // Still use cached data
          setProfilePhoto(parsed.profilePhoto || '');
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
        // Fallback to localStorage data
        const storedStudentData = localStorage.getItem('studentAuth');
        if (storedStudentData) {
          const parsed = JSON.parse(storedStudentData);
          setStudentData(parsed);
          setProfilePhoto(parsed.profilePhoto || '');
        }
      }
    };

    fetchStudentProfile();
  }, []);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
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
      if (!studentData?.id) {
        throw new Error('Student ID not found');
      }

      // Step 1: Get S3 signed URL from API
      console.log('Getting S3 signed URL...');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication header
      const studentAuth = localStorage.getItem('studentAuth');
      if (studentAuth) {
        const parsed = JSON.parse(studentAuth);
        authHeaders['x-api-key'] = parsed.basicAuthToken;
      }

      const BaseURL =
        process.env.NEXT_PUBLIC_BaseURLWorkspace ||
        'https://apis.testkdlakshya.uchhal.in/workspace';

      const signedUrlResponse = await fetch(`${BaseURL}/s3/signed-url`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          type: 'upload',
          id: studentData.id,
          attributes: {
            title: 'profile_photo',
            role: 'student',
          },
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get signed URL');
      }

      const signedUrlData = await signedUrlResponse.json();
      console.log('Signed URL response:', signedUrlData);

      // Extract data from response
      const responseData = signedUrlData.data;
      if (
        !responseData ||
        !responseData.signed_url ||
        !responseData.file_path ||
        !responseData.bucket
      ) {
        throw new Error('Invalid response from server');
      }

      const signedUrl = responseData.signed_url;
      const filePath = responseData.file_path;
      const bucket = responseData.bucket;

      console.log('Signed URL:', signedUrl);
      console.log('File path:', filePath);
      console.log('Bucket:', bucket);

      // Step 2: Upload file to S3 using signed URL
      console.log('Uploading file to S3...');
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        throw new Error('Failed to upload file to S3');
      }

      console.log('File uploaded successfully to S3');

      // Step 3: Construct the final file URL
      // Format: https://{bucket}.s3.{region}.amazonaws.com/{file_path}
      const region = 'ap-south-1'; // Or get from env
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;
      console.log('Final file URL:', fileUrl);

      // Step 4: Update student profile photo URL in localStorage
      setProfilePhoto(fileUrl);
      const updatedStudentData = {
        ...studentData,
        profilePhoto: fileUrl,
      };
      localStorage.setItem('studentAuth', JSON.stringify(updatedStudentData));
      setStudentData(updatedStudentData);
      setShowPhotoModal(false);
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    const updatedStudentData = {
      ...studentData,
      profilePhoto: '',
    };
    localStorage.setItem('studentAuth', JSON.stringify(updatedStudentData));
    setStudentData(updatedStudentData);
    setShowPhotoModal(false);
  };

  // Statistics for the dashboard
  const statistics = dummyStudentDashboardStats;

  // Attendance chart data
  const attendanceChartData = [
    {
      name: 'Present',
      value: dummyStudentAttendance[0].presentDays,
      color: '#4CAF50',
    },
    {
      name: 'Absent',
      value: dummyStudentAttendance[0].absentDays,
      color: '#F44336',
    },
    {
      name: 'Late',
      value: dummyStudentAttendance[0].lateDays,
      color: '#FFC107',
    },
    {
      name: 'Holiday',
      value: dummyStudentAttendance[0].holidayDays,
      color: '#9E9E9E',
    },
  ];

  // Performance chart data
  const performanceChartData = dummyStudentMarks[0].subjects.map((subject) => ({
    name: subject.name,
    marks: subject.obtainedMarks,
    maxMarks: subject.maxMarks,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded shadow-md">
          <p className="text-white">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      {/* Tabs */}
      <div className="flex flex-wrap mb-6 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Overview
        </button>
        {/* <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'marks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Marks
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'results'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Results
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          Fees
        </button> */}
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-blue-500 p-4 rounded-lg">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            'Failed to load profile photo:',
                            profilePhoto,
                          );
                          setProfilePhoto(''); // Clear invalid photo URL
                        }}
                        onLoad={() => {
                          console.log('Profile photo loaded successfully');
                        }}
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-white/60"
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
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-1.5 hover:bg-gray-100 transition-all shadow-lg"
                    title="Change photo"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Student Info */}
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold">
                    STUDENT DASHBOARD
                  </h1>
                  <p>
                    Welcome,{' '}
                    {studentData
                      ? `${studentData.firstName} ${studentData.lastName}`
                      : 'Student'}
                  </p>
                  <p className="text-sm">
                    {studentData?.gradeLevel &&
                      `Class: ${studentData.gradeLevel}`}
                    {studentData?.rollNumber &&
                      studentData.rollNumber.trim() &&
                      ` | Roll No: ${studentData.rollNumber}`}
                  </p>
                  {studentData?.email && (
                    <p className="text-xs mt-1 opacity-90">
                      {studentData.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* <div className="bg-green-500 p-4 rounded-lg hidden sm:block">
              <h2 className="font-bold text-sm md:text-base">
                TODAY&apos;S DATE
              </h2>
              <p className="text-lg md:text-xl">{currentDate}</p>
            </div> */}
          </div>

          {/* Student Information Section */}
          {studentData && (
            <div className="mt-6 bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Details */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">
                    Personal Details
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Full Name
                    </label>
                    <p className="text-white">
                      {studentData.firstName} {studentData.lastName}
                    </p>
                  </div>
                  {studentData.dateOfBirth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Date of Birth
                      </label>
                      <p className="text-white">{studentData.dateOfBirth}</p>
                    </div>
                  )}
                  {studentData.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Email
                      </label>
                      <p className="text-white">{studentData.email}</p>
                    </div>
                  )}
                  {studentData.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Phone
                      </label>
                      <p className="text-white">{studentData.phone}</p>
                    </div>
                  )}
                </div>

                {/* Academic Details */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">
                    Academic Details
                  </h4>
                  {studentData.gradeLevel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Class/Grade
                      </label>
                      <p className="text-white">{studentData.gradeLevel}</p>
                    </div>
                  )}
                  {studentData.rollNumber && studentData.rollNumber.trim() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Roll Number
                      </label>
                      <p className="text-white">{studentData.rollNumber}</p>
                    </div>
                  )}
                  {studentData.admissionDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Admission Date
                      </label>
                      <p className="text-white">{studentData.admissionDate}</p>
                    </div>
                  )}
                  {studentData.status && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Status
                      </label>
                      <p className="text-white capitalize">
                        {studentData.status}
                      </p>
                    </div>
                  )}
                </div>

                {/* Guardian Information */}
                {studentData.guardianInfo && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-3">
                      Guardian Information
                    </h4>
                    {studentData.guardianInfo.father_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Father&apos;s Name
                        </label>
                        <p className="text-white">
                          {studentData.guardianInfo.father_name}
                        </p>
                      </div>
                    )}
                    {studentData.guardianInfo.mother_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Mother&apos;s Name
                        </label>
                        <p className="text-white">
                          {studentData.guardianInfo.mother_name}
                        </p>
                      </div>
                    )}
                    {studentData.guardianInfo.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Guardian Phone
                        </label>
                        <p className="text-white">
                          {studentData.guardianInfo.phone}
                        </p>
                      </div>
                    )}
                    {studentData.guardianInfo.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Guardian Email
                        </label>
                        <p className="text-white">
                          {studentData.guardianInfo.email}
                        </p>
                      </div>
                    )}
                    {studentData.guardianInfo.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400">
                          Address
                        </label>
                        <p className="text-white">
                          {studentData.guardianInfo.address}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">ATTENDANCE</h2>
              <p className="text-xl md:text-2xl">
                {statistics.currentAttendancePercentage}%
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">LAST EXAM</h2>
              <p className="text-xl md:text-2xl">
                {statistics.lastExamPercentage}%
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">
                UPCOMING EVENTS
              </h2>
              <p className="text-xl md:text-2xl">{statistics.upcomingEvents}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <h2 className="font-bold text-sm md:text-base">
                PENDING ASSIGNMENTS
              </h2>
              <p className="text-xl md:text-2xl">
                {statistics.pendingAssignments}
              </p>
            </div>
          </div> */}

          {/* Charts */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Current Month Attendance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      index,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        25 + innerRadius + (outerRadius - innerRadius);
                      const x =
                        cx + radius * Math.cos(-midAngle * RADIAN) * 0.8;
                      const y =
                        cy + radius * Math.sin(-midAngle * RADIAN) * 0.8;

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={attendanceChartData[index].color}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {attendanceChartData[index].name} (
                          {(percent * 100).toFixed(0)}%)
                        </text>
                      );
                    }}
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

           
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Last Exam Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'white' }}
                    tickLine={{ stroke: 'white' }}
                  />
                  <YAxis
                    tick={{ fill: 'white' }}
                    tickLine={{ stroke: 'white' }}
                  />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div> */}

          {/* Quick Actions */}
          {/* <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('attendance')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                View Attendance
              </button>
              <button
                onClick={() => setActiveTab('marks')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Check Marks
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
              >
                View Results
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Fee Details
              </button>
            </div>
          </div> */}

          {/* Upcoming Events */}
          {/* <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {dummyCalendarEvents
                .filter((event) => new Date(event.date) > new Date())
                .slice(0, 3)
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-300">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {event.startTime &&
                          ` • ${event.startTime} - ${event.endTime}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        event.type === 'exam'
                          ? 'bg-red-500'
                          : event.type === 'holiday'
                          ? 'bg-green-500'
                          : event.type === 'assignment'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                ))}
            </div>
          </div> */}
        </div>
      )}

      {/* Marks Tab */}
      {activeTab === 'marks' && <StudentMarks />}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && <StudentAttendance />}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && <StudentCalendar />}

      {/* Results Tab */}
      {activeTab === 'results' && <StudentResults />}

      {/* Fees Tab */}
      {activeTab === 'fees' && <StudentFees />}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Profile Photo</h2>

            {/* Current Photo Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-500"
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

            {/* Upload Buttons */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploadingPhoto ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Choose Photo
                  </>
                )}
              </button>

              {profilePhoto && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={isUploadingPhoto}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove Photo
                </button>
              )}

              <button
                onClick={() => setShowPhotoModal(false)}
                disabled={isUploadingPhoto}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
