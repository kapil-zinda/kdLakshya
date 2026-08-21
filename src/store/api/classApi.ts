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
  // Set when a faculty member is the class teacher rather than just assigned
  // to the class; the teacher dashboards grant access off either pair.
  class_teacher_id?: string | null;
  class_teacher_name?: string;
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

export interface ClassStudent {
  id: string;
  student_id?: string;
  first_name?: string;
  last_name?: string;
  roll_number?: string;
  email: string;
  phone?: string;
  is_monitor?: boolean;
  enrollment_date?: number;
  status: string;
}

export interface ClassStudentsResponse {
  data: {
    type: 'students';
    id: string;
    attributes: ClassStudent;
  }[];
}

export interface Subject {
  id: string;
  orgId: string;
  classId: string;
  /**
   * Named subject_name/subject_code on the wire - createSubject and
   * updateSubject rename the client-side `name` on the way out, and every
   * page reads these spellings back.
   */
  subject_name: string;
  subject_code?: string;
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

/** One subject scheduled inside an exam. */
export interface ExamSubjectDetail {
  subject_id: string;
  subject_name?: string;
  max_marks?: number;
  duration?: number;
  exam_date?: string | number;
  start_time?: string;
}

export interface Exam {
  id: string;
  orgId: string;
  classId?: string;
  /** Named exam_name on the wire, matching CreateExamRequest. */
  exam_name: string;
  exam_type?: string;
  exam_date?: string | number;
  /** Per-subject schedule; an exam covers one or more subjects. */
  subjects?: ExamSubjectDetail[];
  max_marks?: number;
  instructions?: string;
  type?: string;
  status?: string;
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

export interface ExamSubjectMarks {
  subject_id: string;
  max_marks: number;
}

export interface CreateExamRequest {
  exam_name: string;
  exam_date: string; // "YYYY-MM-DD"
  subjects: ExamSubjectMarks[];
}

export interface UpdateExamRequest {
  exam_name?: string;
  exam_date?: string; // "YYYY-MM-DD"
  subjects?: ExamSubjectMarks[];
}

export interface EnrollmentRequest {
  student_id: string;
  // Required by the backend (missing it 400s the whole enrollment) - the
  // roll number the admin assigns when adding a student to a class.
  roll_number: string;
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
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Classes' as const,
                id,
              })),
              { type: 'Classes', id: 'LIST' },
            ]
          : [{ type: 'Classes', id: 'LIST' }],
      // Removed keepUnusedDataFor override - uses base API's 300 seconds (5 minutes)
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
      unknown,
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
      query: ({ orgId, classId }) => `/${orgId}/subjects/class/${classId}`,
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
      query: ({ orgId, classId, subjectData }) => {
        const { name, ...rest } = subjectData;
        return {
          url: `/${orgId}/subjects`,
          method: 'POST',
          body: {
            data: {
              type: 'subjects',
              attributes: {
                ...rest,
                subject_name: name,
                class_id: classId,
              },
            },
          },
        };
      },
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    /**
     * Update subject. Real route is PUT /{org_id}/subjects/{subject_id} (not
     * PATCH, and not nested under /class/{classId}); the backend only
     * accepts subject_name/teacher_id, so `name` is renamed the same way
     * createSubject already does.
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
      query: ({ orgId, subjectId, subjectData }) => {
        const { name, ...rest } = subjectData;
        return {
          url: `/${orgId}/subjects/${subjectId}`,
          method: 'PUT',
          body: {
            data: {
              type: 'subjects',
              attributes: {
                ...rest,
                ...(name !== undefined ? { subject_name: name } : {}),
              },
            },
          },
        };
      },
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Subjects', id: classId },
      ],
    }),

    /**
     * Delete subject. Real route is DELETE /{org_id}/subjects/{subject_id}
     * (not nested under /class/{classId}).
     */
    deleteSubject: builder.mutation<
      void,
      { orgId: string; classId: string; subjectId: string }
    >({
      query: ({ orgId, subjectId }) => ({
        url: `/${orgId}/subjects/${subjectId}`,
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
     * Create exam for class.
     * Real route is POST /{org_id}/exams (not nested under /classes/{classId})
     * - class_id is a body field, not a path segment.
     */
    createExam: builder.mutation<
      ExamResponse,
      { orgId: string; classId: string; examData: CreateExamRequest }
    >({
      query: ({ orgId, classId, examData }) => ({
        url: `/${orgId}/exams`,
        method: 'POST',
        body: {
          data: {
            type: 'exams',
            attributes: { ...examData, class_id: classId },
          },
        },
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    /**
     * Update exam. Real route is PUT /{org_id}/exams/{exam_id} (not PATCH,
     * and not nested under /classes/{classId}).
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
      query: ({ orgId, examId, examData }) => ({
        url: `/${orgId}/exams/${examId}`,
        method: 'PUT',
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
     * Delete exam. Real route is DELETE /{org_id}/exams/{exam_id} (not
     * nested under /classes/{classId}).
     */
    deleteExam: builder.mutation<
      void,
      { orgId: string; classId: string; examId: string }
    >({
      query: ({ orgId, examId }) => ({
        url: `/${orgId}/exams/${examId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        { type: 'Exams', id: classId },
      ],
    }),

    /**
     * Get exams for a teacher
     * Returns all exams where the teacher is assigned
     */
    getTeacherExams: builder.query<
      ExamListResponse,
      { orgId: string; teacherId: string }
    >({
      query: ({ orgId, teacherId }) => `/${orgId}/exams/teacher/${teacherId}`,
      providesTags: (result, error, { teacherId }) => [
        { type: 'Exams', id: `teacher-${teacherId}` },
      ],
    }),

    // ========================================================================
    // FEE OPERATIONS
    // ========================================================================

    /**
     * Get fees for students in a class
     */
    getClassFees: builder.query<
      unknown,
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
    getFeeSummary: builder.query<unknown, { orgId: string; classId?: string }>({
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
  useGetTeacherExamsQuery,

  // Fee operations
  useGetClassFeesQuery,
  useGetFeeSummaryQuery,
} = classApi;
