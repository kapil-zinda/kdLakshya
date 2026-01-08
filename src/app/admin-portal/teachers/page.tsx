'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api';
import { useGetClassesQuery } from '@/store/api/classApi';
import {
  useCreateFacultyMutation,
  useGetFacultyQuery,
  useUpdateFacultyMutation,
} from '@/store/api/facultyApi';

interface Teacher {
  id: string;
  name: string;
  designation: string;
  bio: string;
  photo: string;
  subjects: string[];
  email: string;
  phone: string;
  createdAt?: number;
  updatedAt?: number;
  // Legacy fields for backward compatibility
  employeeId?: string;
  role?: 'Faculty' | 'Staff';
  department?: string;
  experience?: number;
  gender?: 'Male' | 'Female';
  dateOfBirth?: string;
  status?: 'Active' | 'Inactive' | 'On Leave';
  isClassTeacher?: boolean;
  assignedClass?: string;
  assignedSection?: string;
  temporary_password?: string;
}

export default function TeacherManagement() {
  // Get orgId from Redux
  const { userData } = useUserDataRedux();
  const orgId = userData?.orgId;

  // RTK Query hooks for data fetching
  const { data: facultyResponse, isLoading: facultyLoading } =
    useGetFacultyQuery(orgId!, {
      skip: !orgId,
      // Removed refetchOnMountOrArgChange to use RTK Query caching
    });
  const { data: classesResponse, isLoading: classesLoading } =
    useGetClassesQuery(orgId!, {
      skip: !orgId,
    });

  // RTK Query mutations
  const [createFaculty] = useCreateFacultyMutation();
  const [updateFaculty] = useUpdateFacultyMutation();

  // Local UI state
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Teacher>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<Partial<Teacher>>({
    name: '',
    designation: '',
    bio: '',
    photo: '',
    subjects: [],
    email: '',
    phone: '',
    employeeId: '',
    gender: 'Male',
    temporary_password: 'TempPass@123',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  // Transform API data to Teacher format
  const teachers: Teacher[] =
    facultyResponse?.data.map((faculty) => {
      // Normalize role to proper case (capitalize first letter)
      const rawRole = faculty.attributes.role || 'faculty';
      let normalizedRole =
        rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

      // Convert 'Teacher' to 'Faculty' for consistency
      if (normalizedRole === 'Teacher') {
        normalizedRole = 'Faculty';
      }

      // Normalize status to proper case (capitalize first letter)
      const rawStatus = faculty.attributes.status || 'active';
      const normalizedStatus =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

      return {
        id: faculty.id,
        name: faculty.attributes.name,
        designation: faculty.attributes.designation,
        bio: faculty.attributes.bio,
        photo: faculty.attributes.photo,
        subjects: faculty.attributes.subjects,
        email: faculty.attributes.email,
        phone: faculty.attributes.phone,
        experience: faculty.attributes.experience,
        createdAt: faculty.attributes.createdAt,
        updatedAt: faculty.attributes.updatedAt,
        role: normalizedRole as 'Faculty' | 'Staff',
        status: normalizedStatus as 'Active' | 'Inactive' | 'On Leave',
        isClassTeacher: false,
      };
    }) || [];

  // Extract class names
  const classes: string[] =
    classesResponse?.data.map((classData) => `${classData.attributes.class}`) ||
    [];

  // Combined loading state
  const loading = facultyLoading || classesLoading;

  // Add new faculty member using RTK Query mutation
  const handleAddFaculty = async () => {
    try {
      if (
        !addFormData.name ||
        !addFormData.designation ||
        !addFormData.email ||
        !addFormData.phone
      ) {
        alert('Please fill in all required fields');
        return;
      }

      if (!orgId) {
        alert('Organization ID not found');
        return;
      }

      const facultyData = {
        name: addFormData.name!,
        designation: addFormData.designation!,
        experience: addFormData.experience || 1,
        role: addFormData.role || 'faculty',
        bio: addFormData.bio || '',
        photo:
          addFormData.photo ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        subjects: addFormData.subjects || [],
        email: addFormData.email!,
        phone: addFormData.phone!,
        employee_id: addFormData.employeeId || '',
        gender: addFormData.gender || 'Male',
        temporary_password: addFormData.temporary_password || 'TempPass@123',
      };

      // Use RTK Query mutation - cache will auto-update!
      await createFaculty({ orgId, facultyData }).unwrap();

      setShowAddModal(false);

      // Reset form
      setAddFormData({
        name: '',
        designation: '',
        bio: '',
        photo: '',
        subjects: [],
        email: '',
        phone: '',
        employeeId: '',
        gender: 'Male',
        temporary_password: 'TempPass@123',
      });

      alert('Faculty member added successfully!');
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty member. Please try again.');
    }
  };

  const roles = ['All', 'Faculty', 'Staff'];
  const departments = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
    'Computer Science',
    'Physical Education',
    'Arts',
    'Music',
    'Administration',
    'Library',
    'Laboratory',
    'Maintenance',
  ];

  useEffect(() => {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      router.push('/');
      return;
    }
    try {
      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();
      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        router.push('/');
        return;
      }
    } catch (e) {
      localStorage.removeItem('bearerToken');
      router.push('/');
      return;
    }
    // Data is automatically fetched by RTK Query hooks when orgId is available
  }, [router]);

  const filteredTeachers = teachers.filter((teacher) => {
    const roleMatch = selectedRole === 'All' || teacher.role === selectedRole;
    const searchMatch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.employeeId &&
        teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (teacher.department &&
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (teacher.designation &&
        teacher.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    return roleMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Faculty':
        return 'bg-purple-100 text-purple-800';
      case 'Staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({ ...teacher });
    setSelectedTeacher(null);
  };

  const handleSaveTeacher = async () => {
    if (!editingTeacher || !editFormData.id || !orgId) return;

    try {
      const facultyData: Partial<Teacher> = {};

      // Only include fields that were actually changed
      if (editFormData.name) facultyData.name = editFormData.name;
      if (editFormData.designation)
        facultyData.designation = editFormData.designation;
      if (editFormData.bio) facultyData.bio = editFormData.bio;
      if (editFormData.photo) facultyData.photo = editFormData.photo;
      if (editFormData.subjects) facultyData.subjects = editFormData.subjects;
      if (editFormData.email) facultyData.email = editFormData.email;
      if (editFormData.phone) facultyData.phone = editFormData.phone;
      if (editFormData.experience !== undefined)
        facultyData.experience = editFormData.experience;
      if (editFormData.role) facultyData.role = editFormData.role;
      if (editFormData.status) facultyData.status = editFormData.status;

      // Use RTK Query mutation - cache will auto-update!
      await updateFaculty({
        orgId,
        facultyId: editFormData.id,
        facultyData,
      }).unwrap();

      setEditingTeacher(null);
      setEditFormData({});
      alert('Teacher details updated successfully!');
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Failed to update teacher. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeacher(null);
    setEditFormData({});
  };

  const updateFormField = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAddFormField = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setAddFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle photo file selection and upload
  const handlePhotoUpload = async (file: File) => {
    if (!editingTeacher) return;

    try {
      setUploadingPhoto(true);

      // Step 1: Get signed URL
      const signedUrlResponse = await ApiService.getS3SignedUrl(
        editingTeacher.id,
        'profile_photo',
        'faculty',
      );

      // Step 2: Upload file to S3
      await ApiService.uploadFileToS3(signedUrlResponse.data.signed_url, file);

      // Step 3: Update form data with the file path
      updateFormField('photo', signedUrlResponse.data.file_path);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddTeacher = () => {
    // Use the new API-integrated function
    handleAddFaculty();
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      designation: '',
      bio: '',
      photo: '',
      subjects: [],
      email: '',
      phone: '',
      employeeId: '',
      gender: 'Male',
      temporary_password: 'TempPass@123',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground mr-4"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                Teacher Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Teacher/Staff
              </button>
              <div className="text-sm text-muted-foreground">
                Total: {filteredTeachers.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Filter by Role
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedRole === role
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-foreground hover:bg-accent'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search Teachers
            </label>
            <input
              type="text"
              placeholder="Search by name, employee ID, or department..."
              className="w-full max-w-md px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-card shadow-sm rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Teacher/Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image
                          src={teacher.photo}
                          alt={teacher.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {teacher.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.employeeId
                              ? `ID: ${teacher.employeeId}`
                              : teacher.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(teacher.role || 'Faculty')}`}
                        >
                          {teacher.role || 'Faculty'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {teacher.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {teacher.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {teacher.experience
                          ? `${teacher.experience} years`
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.status || 'Active')}`}
                      >
                        {teacher.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No teachers found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* View Teacher Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={selectedTeacher.photo}
                    alt={selectedTeacher.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {selectedTeacher.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTeacher.role} | {selectedTeacher.employeeId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Date of Birth
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedTeacher.dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Gender
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedTeacher.gender}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Phone
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedTeacher.phone}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Email
                          </label>
                          <p className="text-sm text-foreground">
                            {selectedTeacher.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Professional Information
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Department
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedTeacher.department}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Experience
                            </label>
                            <p className="text-sm text-foreground">
                              {selectedTeacher.experience} years
                            </p>
                          </div>
                        </div>
                        {selectedTeacher.isClassTeacher && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Class Teacher
                            </label>
                            <p className="text-sm text-green-900 font-medium">
                              {selectedTeacher.assignedClass}-
                              {selectedTeacher.assignedSection}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditTeacher(selectedTeacher)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Edit Teacher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Teacher Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Add Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Add New Teacher/Staff
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the details below
                  </p>
                </div>
                <button
                  onClick={handleCancelAdd}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Add Form Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.name || ''}
                              onChange={(e) =>
                                updateAddFormField('name', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Designation{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={addFormData.designation || ''}
                              onChange={(e) =>
                                updateAddFormField(
                                  'designation',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                              placeholder="e.g. Senior Teacher, Math Teacher"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Role <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={addFormData.role || 'Faculty'}
                              onChange={(e) =>
                                updateAddFormField('role', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="Faculty">Faculty</option>
                              <option value="Staff">Staff</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Department
                            </label>
                            <select
                              value={addFormData.department || ''}
                              onChange={(e) =>
                                updateAddFormField('department', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="">
                                Select Department (Optional)
                              </option>
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Employee ID
                            </label>
                            <input
                              type="text"
                              value={addFormData.employeeId || ''}
                              onChange={(e) =>
                                updateAddFormField('employeeId', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                              placeholder="e.g. EMP001"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={addFormData.gender || 'Male'}
                              onChange={(e) =>
                                updateAddFormField('gender', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={addFormData.dateOfBirth || ''}
                              onChange={(e) =>
                                updateAddFormField(
                                  'dateOfBirth',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Temporary Password{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={
                                addFormData.temporary_password || 'TempPass@123'
                              }
                              onChange={(e) =>
                                updateAddFormField(
                                  'temporary_password',
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                              placeholder="TempPass@123"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Bio
                          </label>
                          <textarea
                            value={addFormData.bio || ''}
                            onChange={(e) =>
                              updateAddFormField('bio', e.target.value)
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            placeholder="Brief description about the faculty member"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Subjects (comma separated)
                          </label>
                          <input
                            type="text"
                            value={
                              Array.isArray(addFormData.subjects)
                                ? addFormData.subjects.join(', ')
                                : typeof addFormData.subjects === 'string'
                                  ? addFormData.subjects
                                  : ''
                            }
                            onChange={(e) => {
                              // Store as string to preserve commas during typing
                              updateAddFormField('subjects', e.target.value);
                            }}
                            onBlur={(e) => {
                              // Convert to array only on blur (when user leaves the field)
                              const subjectsArray = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter((s) => s);
                              updateAddFormField('subjects', subjectsArray);
                            }}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            placeholder="Math, Science, English"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Professional & Contact Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={addFormData.phone || ''}
                            onChange={(e) =>
                              updateAddFormField('phone', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={addFormData.email || ''}
                            onChange={(e) =>
                              updateAddFormField('email', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            value={addFormData.experience || ''}
                            onChange={(e) =>
                              updateAddFormField(
                                'experience',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        {/* Class Teacher Assignment */}
                        {addFormData.role === 'Faculty' && (
                          <div className="border-t border-border pt-4">
                            <div className="flex items-center mb-3">
                              <input
                                type="checkbox"
                                checked={addFormData.isClassTeacher || false}
                                onChange={(e) =>
                                  updateAddFormField(
                                    'isClassTeacher',
                                    e.target.checked,
                                  )
                                }
                                className="mr-2"
                              />
                              <label className="text-sm font-medium text-foreground">
                                Assign as Class Teacher
                              </label>
                            </div>
                            {addFormData.isClassTeacher && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-1">
                                    Class
                                  </label>
                                  <select
                                    value={addFormData.assignedClass || ''}
                                    onChange={(e) =>
                                      updateAddFormField(
                                        'assignedClass',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                                  >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                      <option key={cls} value={cls}>
                                        {cls}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-1">
                                    Section
                                  </label>
                                  <input
                                    type="text"
                                    value={addFormData.assignedSection || ''}
                                    onChange={(e) =>
                                      updateAddFormField(
                                        'assignedSection',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                                    placeholder="A"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTeacher}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Add Teacher/Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Teacher Modal */}
        {editingTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              {/* Edit Modal Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={editFormData.photo || editingTeacher.photo}
                    alt={editFormData.name || editingTeacher.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Edit Teacher Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {editFormData.name || editingTeacher.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-muted-foreground hover:text-foreground"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Edit Form Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Personal Information
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={editFormData.name || ''}
                              onChange={(e) =>
                                updateFormField('name', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Employee ID
                            </label>
                            <input
                              type="text"
                              value={editFormData.employeeId || ''}
                              onChange={(e) =>
                                updateFormField('employeeId', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Role
                            </label>
                            <select
                              value={editFormData.role || ''}
                              onChange={(e) =>
                                updateFormField('role', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="Faculty">Faculty</option>
                              <option value="Staff">Staff</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Department
                            </label>
                            <select
                              value={editFormData.department || ''}
                              onChange={(e) =>
                                updateFormField('department', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="">No Department</option>
                              {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={editFormData.dateOfBirth || ''}
                              onChange={(e) =>
                                updateFormField('dateOfBirth', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Gender
                            </label>
                            <select
                              value={editFormData.gender || ''}
                              onChange={(e) =>
                                updateFormField('gender', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Status
                            </label>
                            <select
                              value={editFormData.status || ''}
                              onChange={(e) =>
                                updateFormField('status', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="On Leave">On Leave</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional & Contact Information */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Professional & Contact Details
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={editFormData.phone || ''}
                            onChange={(e) =>
                              updateFormField('phone', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) =>
                              updateFormField('email', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Experience (Years)
                          </label>
                          <input
                            type="number"
                            value={editFormData.experience || ''}
                            onChange={(e) =>
                              updateFormField(
                                'experience',
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Profile Photo
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handlePhotoUpload(file);
                                }
                              }}
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                              disabled={uploadingPhoto}
                            />
                            {uploadingPhoto && (
                              <p className="text-sm text-muted-foreground">
                                Uploading photo...
                              </p>
                            )}
                            {editFormData.photo && !uploadingPhoto && (
                              <p className="text-sm text-green-600">
                                Photo uploaded successfully
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Class Teacher Assignment */}
                        {editFormData.role === 'Faculty' && (
                          <div className="border-t border-border pt-4">
                            <div className="flex items-center mb-3">
                              <input
                                type="checkbox"
                                checked={editFormData.isClassTeacher || false}
                                onChange={(e) =>
                                  updateFormField(
                                    'isClassTeacher',
                                    e.target.checked,
                                  )
                                }
                                className="mr-2"
                              />
                              <label className="text-sm font-medium text-foreground">
                                Assign as Class Teacher
                              </label>
                            </div>
                            {editFormData.isClassTeacher && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-1">
                                    Class
                                  </label>
                                  <select
                                    value={editFormData.assignedClass || ''}
                                    onChange={(e) =>
                                      updateFormField(
                                        'assignedClass',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                                  >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                      <option key={cls} value={cls}>
                                        {cls}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-foreground mb-1">
                                    Section
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.assignedSection || ''}
                                    onChange={(e) =>
                                      updateFormField(
                                        'assignedSection',
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                                    placeholder="A"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Modal Footer */}
              <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-accent rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTeacher}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
