/**
 * RTK Query API for Class Management
 * Migrated from src/services/api.ts
 * Handles all class-related operations with automatic caching and state management
 */

import { classApi as baseClassApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Class {
  id: string;
  orgId: string;
  class: string;
  section: string;
  teacher_id?: string | null;
  teacher_name?: string;
  room: string;
  academic_year: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
}

export interface ClassResponse {
  data: {
    type: 'classes';
    id: string;
    attributes: Class;
    links: {
      self: string;
    };
  };
}

export interface ClassListResponse {
  data: {
    type: 'classes';
    id: string;
    attributes: Class;
    links: {
      self: string;
    };
  }[];
}

export interface CreateClassRequest {
  class: string;
  section: string;
  teacher_id?: string;
  room: string;
  academic_year: string;
  description?: string;
}

export interface UpdateClassRequest {
  class?: string;
  section?: string;
  teacher_id?: string | null;
  room?: string;
  academic_year?: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollment_date?: number;
  status: string;
}

export interface ClassStudentsResponse {
  data: {
    type: 'students';
    id: string;
    attributes: Student;
  }[];
}

export interface Subject {
  id: string;
  orgId: string;
  classId: string;
  name: string;
  code: string;
  teacher_id?: string;
  teacher_name?: string;
  description?: string;
  credits?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubjectResponse {
  data: {
    type: 'subjects';
    id: string;
    attributes: Subject;
    links: {
      self: string;
    };
  };
}

export interface SubjectListResponse {
  data: {
    type: 'subjects';
    id: string;
    attributes: Subject;
    links: {
      self: string;
    };
  }[];
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  teacher_id?: string;
  description?: string;
  credits?: number;
}

export interface UpdateSubjectRequest {
  name?: string;
  code?: string;
  teacher_id?: string | null;
  description?: string;
  credits?: number;
}

export interface Exam {
  id: string;
  orgId: string;
  classId: string;
  subjectId: string;
  name: string;
  exam_type: string;
  exam_date: number;
  max_marks: number;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExamResponse {
  data: {
    type: 'exams';
    id: string;
    attributes: Exam;
    links: {
      self: string;
    };
  };
}

export interface ExamListResponse {
  data: {
    type: 'exams';
    id: string;
    attributes: Exam;
    links: {
      self: string;
    };
  }[];
}

export interface CreateExamRequest {
  subjectId: string;
  name: string;
  exam_type: string;
  exam_date: number;
  max_marks: number;
  description?: string;
}

export interface UpdateExamRequest {
  subjectId?: string;
  name?: string;
  exam_type?: string;
  exam_date?: number;
  max_marks?: number;
  description?: string;
}

export interface EnrollmentRequest {
  student_id: string;
}

export interface ClassFeesParams {
  status?: 'pending' | 'partial' | 'completed';
  academic_year?: string;
}

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const classApi = baseClassApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // CLASS OPERATIONS
    // ========================================================================

    /**
     * Get all classes for an organization
     * Cached for 30 seconds
     * Auto-invalidated when classes are created/updated/deleted
     */
    getClasses: builder.query<ClassListResponse, string>({
      query: (orgId) => `/${orgId}/classes`,
      providesTags: (result, error, orgId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Classes' as const,
                id,
              })),
              { type: 'Classes', id: 'LIST' },
            ]
          : [{ type: 'Classes', id: 'LIST' }],
      keepUnusedDataFor: 30, // 30 seconds cache
    }),

    /**
     * Get single class by ID
     */
    getClassById: builder.query<
      ClassResponse,
      { orgId: string; classId: string }
    >({
      query: ({ orgId, classId }) => `/${orgId}/classes/${classId}`,
      providesTags: (result, error, { classId }) => [
        { type: 'Classes', id: classId },
      ],
    }),

    /**
     * Create new class
     * Invalidates class list cache
     */
    createClass: builder.mutation<
      ClassResponse,
      { orgId: string; classData: CreateClassRequest }
    >({
      query: ({ orgId, classData }) => ({
        url: `/${orgId}/classes`,
        method: 'POST',
        body: {
          data: {
            type: 'classes',
            attributes: classData,
          },
        },
      }),
      invalidatesTags: [{ type: 'Classes', id: 'LIST' }],
    }),

    /**
     * Update existing class
     * Invalidates specific class and list cache
     */
    updateClass: builder.mutation<
      ClassResponse,
      { orgId: string; classId: string; classData: UpdateClassRequest }
    >({
      query: ({ orgId, classId, classData }) => ({
        url: `/${orgId}/classes/${classId}`,
        method: 'PATCH',
        body: {
          data: {
            type: 'classes',
            attributes: classData,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Classes', id: classId },
        { type: 'Classes', id: 'LIST' },
      ],
    }),

    /**
     * Delete class
     * Invalidates class list cache
     */
    deleteClass: builder.mutation<void, { orgId: string; classId: string }>({
      query: ({ orgId, classId }) => ({
        url: `/${orgId}/classes/${classId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Classes', id: classId },
        { type: 'Classes', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // STUDENT OPERATIONS
    // ========================================================================

    /**
     * Get students enrolled in a class
     */
    getClassStudents: builder.query<
      ClassStudentsResponse,
      { orgId: string; classId: string }
    >({
      query: ({ orgId, classId }) => `/${orgId}/classes/${classId}/students`,
      providesTags: (result, error, { classId }) => [
        { type: 'ClassStudents', id: classId },
      ],
    }),

    /**
     * Enroll student in class
     */
    enrollStudentInClass: builder.mutation<
      any,
      { orgId: string; classId: string; enrollment: EnrollmentRequest }
    >({
      query: ({ orgId, classId, enrollment }) => ({
        url: `/${orgId}/classes/${classId}/students`,
        method: 'POST',
        body: {
          data: {
            type: 'enrollments',
            attributes: enrollment,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'ClassStudents', id: classId },
        { type: 'Classes', id: classId },
      ],
    }),

    /**
     * Unenroll student from class
     */
    unenrollStudentFromClass: builder.mutation<
      void,
      { orgId: string; classId: string; studentId: string }
    >({
      query: ({ orgId, classId, studentId }) => ({
        url: `/${orgId}/classes/${classId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'ClassStudents', id: classId },
        { type: 'Classes', id: classId },
      ],
    }),

    // ========================================================================
    // SUBJECT OPERATIONS
    // ========================================================================

    /**
     * Get subjects for a class
     */
    getSubjectsForClass: builder.query<
      SubjectListResponse,
      { orgId: string; classId: string }
    >({
      query: ({ orgId, classId }) => `/${orgId}/classes/${classId}/subjects`,
      providesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    /**
     * Create subject for class
     */
    createSubject: builder.mutation<
      SubjectResponse,
      { orgId: string; classId: string; subjectData: CreateSubjectRequest }
    >({
      query: ({ orgId, classId, subjectData }) => ({
        url: `/${orgId}/classes/${classId}/subjects`,
        method: 'POST',
        body: {
          data: {
            type: 'subjects',
            attributes: subjectData,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    /**
     * Update subject
     */
    updateSubject: builder.mutation<
      SubjectResponse,
      {
        orgId: string;
        classId: string;
        subjectId: string;
        subjectData: UpdateSubjectRequest;
      }
    >({
      query: ({ orgId, classId, subjectId, subjectData }) => ({
        url: `/${orgId}/classes/${classId}/subjects/${subjectId}`,
        method: 'PATCH',
        body: {
          data: {
            type: 'subjects',
            attributes: subjectData,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    /**
     * Delete subject
     */
    deleteSubject: builder.mutation<
      void,
      { orgId: string; classId: string; subjectId: string }
    >({
      query: ({ orgId, classId, subjectId }) => ({
        url: `/${orgId}/classes/${classId}/subjects/${subjectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    // ========================================================================
    // EXAM OPERATIONS
    // ========================================================================

    /**
     * Get exams for a class
     */
    getExamsForClass: builder.query<
      ExamListResponse,
      { orgId: string; classId: string }
    >({
      query: ({ orgId, classId }) => `/${orgId}/classes/${classId}/exams`,
      providesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    /**
     * Create exam for class
     */
    createExam: builder.mutation<
      ExamResponse,
      { orgId: string; classId: string; examData: CreateExamRequest }
    >({
      query: ({ orgId, classId, examData }) => ({
        url: `/${orgId}/classes/${classId}/exams`,
        method: 'POST',
        body: {
          data: {
            type: 'exams',
            attributes: examData,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    /**
     * Update exam
     */
    updateExam: builder.mutation<
      ExamResponse,
      {
        orgId: string;
        classId: string;
        examId: string;
        examData: UpdateExamRequest;
      }
    >({
      query: ({ orgId, classId, examId, examData }) => ({
        url: `/${orgId}/classes/${classId}/exams/${examId}`,
        method: 'PATCH',
        body: {
          data: {
            type: 'exams',
            attributes: examData,
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    /**
     * Delete exam
     */
    deleteExam: builder.mutation<
      void,
      { orgId: string; classId: string; examId: string }
    >({
      query: ({ orgId, classId, examId }) => ({
        url: `/${orgId}/classes/${classId}/exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    // ========================================================================
    // FEE OPERATIONS
    // ========================================================================

    /**
     * Get fees for students in a class
     */
    getClassFees: builder.query<
      any,
      { orgId: string; classId: string; params?: ClassFeesParams }
    >({
      query: ({ orgId, classId, params }) => ({
        url: `/${orgId}/classes/${classId}/fees`,
        params: params || {},
      }),
      providesTags: (result, error, { classId }) => [
        { type: 'Fees', id: classId },
      ],
    }),

    /**
     * Get fee summary for class or organization
     */
    getFeeSummary: builder.query<any, { orgId: string; classId?: string }>({
      query: ({ orgId, classId }) =>
        classId
          ? `/${orgId}/classes/${classId}/fees/summary`
          : `/${orgId}/fees/summary`,
      providesTags: (result, error, { classId, orgId }) =>
        classId
          ? [{ type: 'Fees', id: classId }]
          : [{ type: 'Fees', id: orgId }],
    }),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  // Class operations
  useGetClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,

  // Student operations
  useGetClassStudentsQuery,
  useEnrollStudentInClassMutation,
  useUnenrollStudentFromClassMutation,

  // Subject operations
  useGetSubjectsForClassQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,

  // Exam operations
  useGetExamsForClassQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,

  // Fee operations
  useGetClassFeesQuery,
  useGetFeeSummaryQuery,
} = classApi;
