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
      permissions?: Record<string, any>;
      org_id?: string;
      orgId?: string;
      org?: string;
      phone?: string;
      designation?: string;
      experience?: string;
      profile_photo?: string;
      photo?: string;
    };
    user_permissions?: Record<string, any>;
  };
}

// Processed user data
export interface ProcessedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, any>;
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

// Helper function to determine user role
const determineUserRole = (
  userData: UserApiResponse['data'],
): 'admin' | 'teacher' | 'student' => {
  // Check user role from attributes first
  if (userData.attributes?.role === 'faculty') {
    return 'teacher';
  }

  if (userData.attributes?.type === 'faculty') {
    return 'teacher';
  }

  // Check permissions
  if (userData.user_permissions) {
    if (
      userData.user_permissions['admin'] ||
      userData.user_permissions['organization_admin'] ||
      userData.user_permissions['org']
    ) {
      return 'admin';
    }

    if (
      userData.user_permissions['teacher'] ||
      userData.user_permissions['instructor']
    ) {
      return 'teacher';
    }
  }

  // Check permissions in attributes
  if (userData.attributes?.permissions?.['org']) {
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
