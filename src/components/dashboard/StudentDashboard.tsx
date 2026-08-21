'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { UserData } from '@/app/interfaces/userInterface';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { studentApiKeyHeader } from '@/utils/authHeaders';
import { toast } from 'react-toastify';

import StudentAttendance from './StudentAttendance';
import StudentFees from './StudentFees';
import StudentMarks from './StudentMarks';

interface StudentDashboardProps {
  /**
   * Accepted so the dashboard shells can render this the same way as the
   * teacher/admin ones, but unused: every field shown here comes from the
   * student's own `studentAuth` record plus a /users/me refresh.
   */
  userData: UserData;
}

/** Guardian block as the students service returns it. */
interface StudentGuardianInfo {
  father_name?: string;
  mother_name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * The student's own profile, merged from the cached `studentAuth` blob and the
 * /users/me refresh below.
 */
interface StudentProfile {
  id?: string;
  orgId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  rollNumber?: string;
  gradeLevel?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  status?: string;
  profilePhoto?: string;
  basicAuthToken?: string;
  guardianInfo?: StudentGuardianInfo;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userData: _userData,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Get student data from localStorage
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
        const { makeApiCall } = await import('@/utils/ApiRequest');

        try {
          const data = await makeApiCall({
            path: '/users/me?include=permission',
            method: 'GET',
            baseUrl: 'auth',
            customAuthHeaders: studentApiKeyHeader(parsed.basicAuthToken),
          });
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
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
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
      } finally {
        setProfileLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      if (!studentData?.id || !studentData?.orgId) {
        throw new Error('Student ID not found');
      }

      const studentAuth = localStorage.getItem('studentAuth');
      let basicAuthToken = '';
      if (studentAuth) {
        const parsed = JSON.parse(studentAuth);
        basicAuthToken = parsed.basicAuthToken;
      }

      const { makeApiCall } = await import('@/utils/ApiRequest');

      // Step 1: Get a presigned S3 URL from the dedicated student
      // profile-picture endpoint. This endpoint persists the S3 key on
      // the student's record server-side as soon as it's issued, so the
      // photo survives across devices/logins without any extra save step.
      const signedUrlData = await makeApiCall({
        path: `/${studentData.orgId}/students/${studentData.id}/profile-picture`,
        method: 'POST',
        baseUrl: 'auth',
        customAuthHeaders: studentApiKeyHeader(basicAuthToken),
        headers: {
          'Content-Type': 'application/json',
        },
        payload: {
          content_type: file.type,
        },
      });

      const responseData = signedUrlData.data?.attributes;
      if (!responseData?.upload_url) {
        throw new Error('Invalid response from server');
      }

      const signedUrl: string = responseData.upload_url;

      // Step 2: Upload the file to S3 using the signed URL
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

      // The object URL (stripped of the presigned query string) is the
      // best-effort preview for this session; if the bucket isn't public
      // the <img onError> fallback below will hide it instead of showing
      // a broken image. Either way the upload itself is now saved
      // server-side (profile_picture_key), which is the actual bug fixed.
      const fileUrl = signedUrl.split('?')[0];

      setProfilePhoto(fileUrl);
      const updatedStudentData = {
        ...studentData,
        profilePhoto: fileUrl,
      };
      localStorage.setItem('studentAuth', JSON.stringify(updatedStudentData));
      setStudentData(updatedStudentData);
      setShowPhotoModal(false);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!studentData?.id || !studentData?.orgId) return;

    try {
      const studentAuth = localStorage.getItem('studentAuth');
      const basicAuthToken = studentAuth
        ? JSON.parse(studentAuth).basicAuthToken
        : '';

      const { makeApiCall } = await import('@/utils/ApiRequest');
      await makeApiCall({
        path: `/${studentData.orgId}/students/${studentData.id}/profile-picture`,
        method: 'DELETE',
        baseUrl: 'auth',
        customAuthHeaders: studentApiKeyHeader(basicAuthToken),
      });

      setProfilePhoto('');
      const updatedStudentData = {
        ...studentData,
        profilePhoto: '',
      };
      localStorage.setItem('studentAuth', JSON.stringify(updatedStudentData));
      setStudentData(updatedStudentData);
      setShowPhotoModal(false);
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('cachedUserData');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    localStorage.removeItem('adminAuth');

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear all localStorage (comprehensive clear)
    localStorage.clear();

    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Redirect to homepage with cache clear
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Theme Toggle and Logout Button */}
      <div className="bg-background border-b border-border sticky top-0 z-40 no-print">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">
              Student Dashboard
            </h2>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 text-foreground">
        {/* Tabs */}
        <div className="flex flex-wrap mb-6 gap-2 no-print">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'marks'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            Marks
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'attendance'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'fees'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-foreground hover:bg-accent'
            }`}
          >
            Fees
          </button>
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
                        <Image
                          src={profilePhoto}
                          alt="Profile"
                          width={80}
                          height={80}
                          unoptimized
                          className="w-full h-full object-cover"
                          onError={() => {
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
                    {profileLoading ? (
                      <div
                        className="mt-2 space-y-2 animate-pulse"
                        aria-label="Loading profile"
                      >
                        <div className="h-4 w-40 bg-white/30 rounded" />
                        <div className="h-3 w-28 bg-white/20 rounded" />
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information Section */}
            {studentData && (
              <div className="mt-6 bg-card border border-border p-6 rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-blue-400 mb-3">
                      Personal Details
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <p className="text-foreground">
                        {studentData.firstName} {studentData.lastName}
                      </p>
                    </div>
                    {studentData.dateOfBirth && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Date of Birth
                        </label>
                        <p className="text-foreground">
                          {studentData.dateOfBirth}
                        </p>
                      </div>
                    )}
                    {studentData.email && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <p className="text-foreground">{studentData.email}</p>
                      </div>
                    )}
                    {studentData.phone && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Phone
                        </label>
                        <p className="text-foreground">{studentData.phone}</p>
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
                        <label className="block text-sm font-medium text-muted-foreground">
                          Class/Grade
                        </label>
                        <p className="text-foreground">
                          {studentData.gradeLevel}
                        </p>
                      </div>
                    )}
                    {studentData.rollNumber &&
                      studentData.rollNumber.trim() && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">
                            Roll Number
                          </label>
                          <p className="text-foreground">
                            {studentData.rollNumber}
                          </p>
                        </div>
                      )}
                    {studentData.admissionDate && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Admission Date
                        </label>
                        <p className="text-foreground">
                          {studentData.admissionDate}
                        </p>
                      </div>
                    )}
                    {studentData.status && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Status
                        </label>
                        <p className="text-foreground capitalize">
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
                          <label className="block text-sm font-medium text-muted-foreground">
                            Father&apos;s Name
                          </label>
                          <p className="text-foreground">
                            {studentData.guardianInfo.father_name}
                          </p>
                        </div>
                      )}
                      {studentData.guardianInfo.mother_name && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">
                            Mother&apos;s Name
                          </label>
                          <p className="text-foreground">
                            {studentData.guardianInfo.mother_name}
                          </p>
                        </div>
                      )}
                      {studentData.guardianInfo.phone && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">
                            Guardian Phone
                          </label>
                          <p className="text-foreground">
                            {studentData.guardianInfo.phone}
                          </p>
                        </div>
                      )}
                      {studentData.guardianInfo.email && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">
                            Guardian Email
                          </label>
                          <p className="text-foreground">
                            {studentData.guardianInfo.email}
                          </p>
                        </div>
                      )}
                      {studentData.guardianInfo.address && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground">
                            Address
                          </label>
                          <p className="text-foreground">
                            {studentData.guardianInfo.address}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && <StudentMarks />}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && <StudentAttendance />}

        {/* Fees Tab */}
        {activeTab === 'fees' && <StudentFees />}

        {/* Photo Upload Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Update Profile Photo
              </h2>

              {/* Current Photo Preview */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt="Profile"
                      width={128}
                      height={128}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-muted-foreground"
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
                  className="w-full bg-muted hover:bg-accent text-foreground py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Supported formats: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
