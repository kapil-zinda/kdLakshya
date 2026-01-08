/**
 * RTK Query API for Faculty Management
 * Migrated from src/services/api.ts
 * Handles all faculty-related operations with automatic caching and state management
 */

import { baseApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Faculty {
  id: string;
  orgId: string;
  name: string;
  designation: string;
  experience: number;
  role: string; // 'faculty' or 'staff'
  bio: string;
  photo: string;
  subjects: string[];
  email: string;
  phone: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
  temporary_password?: string;
  employee_id?: string;
  gender?: string;
}

export interface FacultyResponse {
  data: {
    type: 'faculty';
    id: string;
    attributes: Faculty;
    links: {
      self: string;
    };
  };
}

export interface FacultyListResponse {
  data: {
    type: 'faculty';
    id: string;
    attributes: Faculty;
    links: {
      self: string;
    };
  }[];
}

export interface CreateFacultyRequest {
  name: string;
  designation: string;
  experience?: number;
  role?: string;
  bio: string;
  photo: string;
  subjects: string[];
  email: string;
  phone: string;
  temporary_password?: string;
  employee_id?: string;
  gender?: string;
}

export interface UpdateFacultyRequest {
  name?: string;
  designation?: string;
  experience?: number;
  role?: string;
  bio?: string;
  photo?: string;
  subjects?: string[];
  email?: string;
  phone?: string;
  status?: string;
}

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const facultyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // FACULTY OPERATIONS
    // ========================================================================

    /**
     * Get all faculty members for an organization (excludes staff)
     * Cached for 60 seconds
     * Auto-invalidated when faculty are created/updated/deleted
     */
    getFaculty: builder.query<FacultyListResponse, string>({
      query: (orgId) => `/${orgId}/faculty`,
      transformResponse: (response: FacultyListResponse) => {
        // Filter to return only faculty members (exclude staff) - case insensitive
        const filteredData = {
          ...response,
          data: response.data.filter(
            (member) => member.attributes.role?.toLowerCase() === 'faculty',
          ),
        };
        console.log(
          `📚 Filtered ${response.data.length} total members to ${filteredData.data.length} faculty (excluding staff)`,
        );
        return filteredData;
      },
      providesTags: (result, error, orgId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Teachers' as const,
                id,
              })),
              { type: 'Teachers', id: 'LIST' },
            ]
          : [{ type: 'Teachers', id: 'LIST' }],
      // Removed keepUnusedDataFor override - uses base API's 300 seconds (5 minutes)
    }),

    /**
     * Get all faculty members including staff (no filter)
     * Used for admin purposes where you need to see all members
     */
    getAllFacultyMembers: builder.query<FacultyListResponse, string>({
      query: (orgId) => `/${orgId}/faculty`,
      providesTags: (result, error, orgId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Teachers' as const,
                id,
              })),
              { type: 'Teachers', id: 'ALL' },
            ]
          : [{ type: 'Teachers', id: 'ALL' }],
      // Removed keepUnusedDataFor override - uses base API's 300 seconds (5 minutes)
    }),

    /**
     * Get single faculty member by ID
     */
    getFacultyById: builder.query<
      FacultyResponse,
      { orgId: string; facultyId: string }
    >({
      query: ({ orgId, facultyId }) => `/${orgId}/faculty/${facultyId}`,
      providesTags: (result, error, { facultyId }) => [
        { type: 'Teachers', id: facultyId },
      ],
    }),

    /**
     * Create new faculty member
     * Invalidates faculty list cache
     */
    createFaculty: builder.mutation<
      FacultyResponse,
      { orgId: string; facultyData: CreateFacultyRequest }
    >({
      query: ({ orgId, facultyData }) => {
        // Ensure all required fields are present
        const completeAttributes = {
          ...facultyData,
          experience: facultyData.experience || 1, // Default to 1 year if not provided
          role: facultyData.role || 'faculty', // Default role
          temporary_password: facultyData.temporary_password || 'TempPass123!', // Default temp password
        };

        return {
          url: `/${orgId}/faculty`,
          method: 'POST',
          body: {
            data: {
              type: 'faculty',
              attributes: completeAttributes,
            },
          },
          headers: {
            'Content-Type': 'application/vnd.api+json',
          },
        };
      },
      invalidatesTags: [
        { type: 'Teachers', id: 'LIST' },
        { type: 'Teachers', id: 'ALL' },
      ],
    }),

    /**
     * Update existing faculty member
     * Invalidates specific faculty and list cache
     */
    updateFaculty: builder.mutation<
      FacultyResponse,
      { orgId: string; facultyId: string; facultyData: UpdateFacultyRequest }
    >({
      query: ({ orgId, facultyId, facultyData }) => ({
        url: `/${orgId}/faculty/${facultyId}`,
        method: 'PATCH',
        body: {
          data: {
            type: 'faculty',
            attributes: facultyData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { facultyId }) => [
        { type: 'Teachers', id: facultyId },
        { type: 'Teachers', id: 'LIST' },
        { type: 'Teachers', id: 'ALL' },
      ],
    }),

    /**
     * Delete faculty member
     * Invalidates faculty list cache
     */
    deleteFaculty: builder.mutation<void, { orgId: string; facultyId: string }>(
      {
        query: ({ orgId, facultyId }) => ({
          url: `/${orgId}/faculty/${facultyId}`,
          method: 'DELETE',
        }),
        invalidatesTags: (result, error, { facultyId }) => [
          { type: 'Teachers', id: facultyId },
          { type: 'Teachers', id: 'LIST' },
          { type: 'Teachers', id: 'ALL' },
        ],
      },
    ),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  // Faculty operations
  useGetFacultyQuery,
  useGetAllFacultyMembersQuery,
  useGetFacultyByIdQuery,
  useCreateFacultyMutation,
  useUpdateFacultyMutation,
  useDeleteFacultyMutation,
} = facultyApi;
