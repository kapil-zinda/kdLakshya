import { baseApi } from './baseApi';

// User data interface matching backend response
interface UserApiResponse {
  data: {
    id: string;
    attributes: {
      email: string;
      first_name?: string;
      last_name?: string;
      name?: string;
      role?: string;
      type?: string;
      permissions?: Record<string, unknown>;
      org_id?: string;
      orgId?: string;
      org?: string;
      phone?: string;
      designation?: string;
      experience?: string;
      profile_photo?: string;
      photo?: string;
    };
    user_permissions?: {
      role?: string; // '*' | 'head' | 'superwise' | 'manage' | 'lead' | 'edit' | 'view' | 'other'
      role_description?: string;
      role_level?: number;
      permissions?: string[];
      user_type?: string; // 'student' | 'faculty' | 'admin_staff'
      class_assignments?: Record<string, unknown>;
    };
  };
}

// Processed user data
export interface ProcessedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, unknown>;
  orgId: string;
  type?: string;
  phone?: string;
  designation?: string;
  experience?: string;
  profilePhoto?: string;
}

// Organization response
interface OrganizationApiResponse {
  data: {
    id: string;
    attributes: {
      name: string;
      subdomain: string;
      logo?: string;
      address?: string;
      phone?: string;
      email?: string;
    };
  };
}

export interface ProcessedOrgData {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * Determine the app-level role ('admin' | 'teacher' | 'student') for a user.
 *
 * Keys off `user_permissions.role`, the real field the backend returns
 * (services/auth/open-api.yaml UserPermissionsObject) - one of the RBAC
 * roles: '*'/'head' (org admin), 'superwise' (clerk/office staff), 'manage'
 * (class teacher), 'lead' (subject teacher), 'edit' (student monitor),
 * 'view'/'other' (plain student). `user_permissions.user_type` is a
 * secondary signal used only if `role` is missing.
 *
 * `attributes.role`/`attributes.type` are NOT read here - the backend's
 * UserAttributesObject schema doesn't define either field, so checking them
 * always silently fell through to 'student' regardless of the real role.
 */
export const determineUserRole = (
  userData: UserApiResponse['data'],
): 'admin' | 'teacher' | 'student' => {
  const role = userData.user_permissions?.role;

  if (role === '*' || role === 'head' || role === 'superwise') {
    return 'admin';
  }
  if (role === 'manage' || role === 'lead') {
    return 'teacher';
  }
  if (role === 'edit' || role === 'view' || role === 'other') {
    return 'student';
  }

  // Defensive fallback if `role` wasn't populated for some reason.
  const userType = userData.user_permissions?.user_type;
  if (userType === 'faculty') {
    return 'teacher';
  }
  if (userType === 'admin_staff') {
    return 'admin';
  }

  return 'student';
};

// Helper function to get orgId
const getOrgId = (userData: UserApiResponse['data']): string => {
  // For localhost development, use hardcoded orgId
  const LOCALHOST_ORG_ID = '68d6b128d88f00c8b1b4a89a';
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('localhost:'));

  if (isLocalhost) {
    console.log('🏠 Using hardcoded localhost orgId:', LOCALHOST_ORG_ID);
    return LOCALHOST_ORG_ID;
  }

  return (
    userData.attributes.org_id ||
    userData.attributes.orgId ||
    userData.attributes.org ||
    ''
  );
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getUserProfile: builder.query<ProcessedUserData, void>({
      query: () => '/users/me?include=permission',
      providesTags: ['User'],
      transformResponse: (response: UserApiResponse) => {
        const userData = response.data;
        const role = determineUserRole(userData);
        const orgId = getOrgId(userData);

        return {
          id: userData.id,
          email: userData.attributes.email,
          firstName:
            userData.attributes.first_name ||
            userData.attributes.name?.split(' ')[0] ||
            'User',
          lastName:
            userData.attributes.last_name ||
            userData.attributes.name?.split(' ').slice(1).join(' ') ||
            '',
          role,
          permissions:
            userData.attributes.permissions || userData.user_permissions || {},
          orgId,
          type: userData.attributes.type || userData.attributes.role,
          phone: userData.attributes.phone || '',
          designation: userData.attributes.designation || '',
          experience: userData.attributes.experience || '',
          profilePhoto:
            userData.attributes.profile_photo ||
            userData.attributes.photo ||
            '',
        };
      },
    }),

    // Get organization by ID
    getOrganizationById: builder.query<ProcessedOrgData, string>({
      query: (orgId) => `/organizations/${orgId}`,
      providesTags: ['Organization'],
      transformResponse: (response: OrganizationApiResponse) => {
        const org = response.data;
        return {
          id: org.id,
          name: org.attributes.name,
          subdomain: org.attributes.subdomain,
          logo: org.attributes.logo,
          address: org.attributes.address,
          phone: org.attributes.phone,
          email: org.attributes.email,
        };
      },
    }),

    // Get organization by subdomain
    getOrganizationBySubdomain: builder.query<ProcessedOrgData, string>({
      query: (subdomain) => `/organizations/subdomain/${subdomain}`,
      providesTags: ['Organization'],
      transformResponse: (response: OrganizationApiResponse) => {
        const org = response.data;
        return {
          id: org.id,
          name: org.attributes.name,
          subdomain: org.attributes.subdomain,
          logo: org.attributes.logo,
          address: org.attributes.address,
          phone: org.attributes.phone,
          email: org.attributes.email,
        };
      },
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationBySubdomainQuery,
  useLazyGetUserProfileQuery,
  useLazyGetOrganizationByIdQuery,
} = authApi;
