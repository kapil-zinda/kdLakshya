'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import toast, { Toaster } from 'react-hot-toast';

interface TeacherProfileContentProps {
  userData: {
    firstName: string;
    lastName: string;
    userEmail: string;
    type?: string;
    role?: string;
  };
}

function TeacherProfileContent({ userData }: TeacherProfileContentProps) {
  const router = useRouter();

  // Get full user data from Redux (includes all fields like email, type, phone, etc.)
  const { userData: fullUserData } = useUserDataRedux();

  const [teacherData, setTeacherData] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load profile data from Redux
    if (!fullUserData) {
      setIsLoading(false);
      return;
    }

    try {
      // Use full user data from Redux (has all fields including email, type, phone, etc.)
      const profileData = {
        id: fullUserData.id || '',
        email: fullUserData.email || '',
        firstName: fullUserData.firstName || userData.firstName,
        lastName: fullUserData.lastName || userData.lastName,
        phone: fullUserData.phone || '',
        designation: fullUserData.designation || '',
        experience: fullUserData.experience || '',
        profilePhoto: fullUserData.profilePhoto || '',
        type: fullUserData.type || '',
        role: fullUserData.role || '',
      };

      setTeacherData(profileData);

      // Set profile photo URL if available
      if (profileData.profilePhoto) {
        setProfilePhotoUrl(profileData.profilePhoto);
      }

      // Sync to localStorage for backward compatibility
      localStorage.setItem('cachedUserData', JSON.stringify(profileData));

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setIsLoading(false);
    }
  }, [fullUserData, userData]);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    const uploadToast = toast.loading('Uploading profile photo...');

    try {
      if (!teacherData?.id) {
        throw new Error('Teacher ID not found');
      }

      const tokenData = localStorage.getItem('bearerToken');
      if (!tokenData) {
        throw new Error('No bearer token found');
      }
      const parsed = JSON.parse(tokenData);

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
      const signedUrl = signedData.data.signed_url;
      const filePath = signedData.data.file_path;
      const bucket = signedData.data.bucket || 'workspace-test-org-data-v1';

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

      // Update the profile photo in the backend
      const BaseURLAuth =
        process.env.NEXT_PUBLIC_BaseURLAuth ||
        'https://apis.testkdlakshya.uchhal.in/auth';

      const updateResponse = await fetch(`${BaseURLAuth}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${parsed.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'users',
            id: teacherData.id,
            attributes: {
              profile_photo: photoUrl,
            },
          },
        }),
      });

      if (!updateResponse.ok) {
        console.warn(
          'Failed to update profile photo in backend:',
          updateResponse.status,
        );
        // Don't throw error, photo is uploaded to S3 successfully
      }

      // Update teacher data with new photo URL
      const updatedTeacherData = {
        ...teacherData,
        profilePhoto: photoUrl,
      };
      setTeacherData(updatedTeacherData);

      // Update the displayed photo URL
      setProfilePhotoUrl(photoUrl);

      toast.success('Profile photo updated successfully!', {
        id: uploadToast,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload photo. Please try again.',
        { id: uploadToast },
      );
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/teacher-dashboard';
                }}
                className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Go back"
                type="button"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Teacher Profile
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative flex flex-col items-center">
              <div className="relative mb-3">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      console.error(
                        'Failed to load profile photo:',
                        profilePhotoUrl,
                      );
                      // Hide the broken image
                      e.currentTarget.style.display = 'none';
                      // Show initials by clearing the URL
                      setProfilePhotoUrl('');
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                    {userData.firstName?.[0]}
                    {userData.lastName?.[0]}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {userData.firstName} {userData.lastName}
              </h2>
              <p className="text-gray-600">
                {teacherData?.designation || 'Teacher'}
              </p>
              {teacherData?.experience && (
                <p className="text-sm text-gray-500 mt-1">
                  {teacherData.experience} years of experience
                </p>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            {teacherData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {teacherData.firstName} {teacherData.lastName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {teacherData.email}
                  </div>
                </div>

                {teacherData.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                      {teacherData.phone}
                    </div>
                  </div>
                )}

                {teacherData.designation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                      {teacherData.designation}
                    </div>
                  </div>
                )}

                {teacherData.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                      {teacherData.experience} years
                    </div>
                  </div>
                )}

                {teacherData.type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 capitalize">
                      {teacherData.type}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                Loading profile information...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TeacherProfilePage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'faculty', 'admin']}>
      {(userData) => <TeacherProfileContent userData={userData} />}
    </DashboardWrapper>
  );
}
