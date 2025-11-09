/**
 * RTK Query API for Student Management
 * Migrated from src/services/api.ts
 * Handles all student-related operations with automatic caching and state management
 */

import { baseApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StudentGuardianInfo {
  father_name: string;
  mother_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Student {
  id: string;
  orgId: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string; // DD/MM/YYYY format
  gender?: string;
  unique_id?: string;
  profile?: string;
  grade_level: string;
  admission_date: string; // DD/MM/YYYY format
  guardian_info: StudentGuardianInfo;
  is_monitor?: boolean;
  class_id?: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
  temporary_password?: string;
}

export interface StudentResponse {
  data: {
    type: 'students';
    id: string;
    attributes: Student;
    links: {
      self: string;
    };
  };
}

export interface StudentListResponse {
  data: {
    type: 'students';
    id: string;
    attributes: Student;
    links: {
      self: string;
    };
  }[];
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string; // ISO date string
  gender?: string;
  uniqueId?: string;
  profile?: string;
  gradeLevel: string;
  guardianInfo: {
    fatherName: string;
    motherName: string;
    phone: string;
    email: string;
    address: string;
  };
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date string
  gender?: string;
  uniqueId?: string;
  profile?: string;
  gradeLevel?: string;
  isMonitor?: boolean;
  classId?: string;
  guardianInfo?: {
    fatherName?: string;
    motherName?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface StudentFee {
  id: string;
  orgId: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  fee_structure_id?: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: 'pending' | 'partial' | 'completed';
  due_date?: number;
  academic_year: string;
  createdAt: number;
  updatedAt: number;
}

export interface StudentFeeResponse {
  data: {
    type: 'student_fees';
    id: string;
    attributes: StudentFee;
    links: {
      self: string;
    };
  };
}

export interface StudentFeeListResponse {
  data: {
    type: 'student_fees';
    id: string;
    attributes: StudentFee;
    links: {
      self: string;
    };
  }[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date from ISO string to DD/MM/YYYY
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Transform create student request to API format
 */
const transformCreateStudentRequest = (
  studentData: CreateStudentRequest,
): any => {
  return {
    data: {
      type: 'students',
      attributes: {
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone,
        date_of_birth: formatDate(studentData.dob),
        grade_level: studentData.gradeLevel,
        admission_date: formatDate(new Date().toISOString()),
        guardian_info: {
          father_name: studentData.guardianInfo.fatherName,
          mother_name: studentData.guardianInfo.motherName,
          phone: studentData.guardianInfo.phone,
          email: studentData.guardianInfo.email,
          address: studentData.guardianInfo.address,
        },
        ...(studentData.gender && { gender: studentData.gender }),
        ...(studentData.uniqueId && { unique_id: studentData.uniqueId }),
        ...(studentData.profile && { profile: studentData.profile }),
      },
    },
  };
};

/**
 * Transform update student request to API format
 */
const transformUpdateStudentRequest = (
  studentData: UpdateStudentRequest,
): any => {
  const attributes: any = {};

  if (studentData.firstName) attributes.first_name = studentData.firstName;
  if (studentData.lastName) attributes.last_name = studentData.lastName;
  if (studentData.email) attributes.email = studentData.email;
  if (studentData.phone) attributes.phone = studentData.phone;
  if (studentData.dob) attributes.date_of_birth = formatDate(studentData.dob);
  if (studentData.gender) attributes.gender = studentData.gender;
  if (studentData.uniqueId) attributes.unique_id = studentData.uniqueId;
  if (studentData.profile) attributes.profile = studentData.profile;
  if (studentData.gradeLevel) attributes.grade_level = studentData.gradeLevel;
  if (studentData.isMonitor !== undefined)
    attributes.is_monitor = studentData.isMonitor;
  if (studentData.classId) attributes.class_id = studentData.classId;

  if (studentData.guardianInfo) {
    attributes.guardian_info = {};
    if (studentData.guardianInfo.fatherName)
      attributes.guardian_info.father_name =
        studentData.guardianInfo.fatherName;
    if (studentData.guardianInfo.motherName)
      attributes.guardian_info.mother_name =
        studentData.guardianInfo.motherName;
    if (studentData.guardianInfo.phone)
      attributes.guardian_info.phone = studentData.guardianInfo.phone;
    if (studentData.guardianInfo.email)
      attributes.guardian_info.email = studentData.guardianInfo.email;
    if (studentData.guardianInfo.address)
      attributes.guardian_info.address = studentData.guardianInfo.address;
  }

  return {
    data: {
      type: 'students',
      attributes,
    },
  };
};

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // STUDENT OPERATIONS
    // ========================================================================

    /**
     * Get all students for an organization
     * Cached for 30 seconds
     * Auto-invalidated when students are created/updated/deleted
     */
    getStudents: builder.query<StudentListResponse, string>({
      query: (orgId) => `/${orgId}/students`,
      providesTags: (result, error, orgId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Students' as const,
                id,
              })),
              { type: 'Students', id: 'LIST' },
            ]
          : [{ type: 'Students', id: 'LIST' }],
      keepUnusedDataFor: 30, // 30 seconds cache
    }),

    /**
     * Get single student by ID
     */
    getStudentById: builder.query<
      StudentResponse,
      { orgId: string; studentId: string }
    >({
      query: ({ orgId, studentId }) => `/${orgId}/students/${studentId}`,
      providesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
      ],
    }),

    /**
     * Create new student
     * Invalidates student list cache
     */
    createStudent: builder.mutation<
      StudentResponse,
      { orgId: string; studentData: CreateStudentRequest }
    >({
      query: ({ orgId, studentData }) => ({
        url: `/${orgId}/students`,
        method: 'POST',
        body: transformCreateStudentRequest(studentData),
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),

    /**
     * Update existing student
     * Invalidates specific student and list cache
     */
    updateStudent: builder.mutation<
      StudentResponse,
      { orgId: string; studentId: string; studentData: UpdateStudentRequest }
    >({
      query: ({ orgId, studentId, studentData }) => ({
        url: `/${orgId}/students/${studentId}`,
        method: 'PATCH',
        body: transformUpdateStudentRequest(studentData),
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: 'Students', id: studentId },
        { type: 'Students', id: 'LIST' },
      ],
    }),

    /**
     * Delete student
     * Invalidates student list cache
     */
    deleteStudent: builder.mutation<void, { orgId: string; studentId: string }>(
      {
        query: ({ orgId, studentId }) => ({
          url: `/${orgId}/students/${studentId}`,
          method: 'DELETE',
        }),
        invalidatesTags: (result, error, { studentId }) => [
          { type: 'Students', id: studentId },
          { type: 'Students', id: 'LIST' },
        ],
      },
    ),

    // ========================================================================
    // STUDENT FEE OPERATIONS
    // ========================================================================

    /**
     * Get fees for a specific student
     */
    getStudentFees: builder.query<
      StudentFeeListResponse,
      { orgId: string; studentId: string }
    >({
      query: ({ orgId, studentId }) => `/${orgId}/students/${studentId}/fees`,
      providesTags: (result, error, { studentId }) => [
        { type: 'Fees', id: studentId },
      ],
    }),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  // Student operations
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,

  // Fee operations
  useGetStudentFeesQuery,
} = studentApi;
