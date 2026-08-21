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
 * `user_permissions` is only present when the request asks for
 * `?include=permission` AND the backend fills it in. When it is missing this
 * falls back to `attributes.permissions`, which is the raw stored permission
 * document. That document is keyed by *scope*, not by role - an org admin is
 * `{"org": "*"}`, not `{"role": "*"}` - so the role has to be resolved out of
 * it. Reading `user_permissions.role` alone meant an org admin with
 * `{"org": "*"}` matched nothing and fell through to the 'student' default,
 * which routed them to the student dashboard and showed them no data.
 */
const ROLE_PRECEDENCE = [
  '*',
  'head',
  'superwise',
  'manage',
  'lead',
  'edit',
  'view',
  'other',
] as const;

/**
 * Resolve the highest-ranking role out of a scope-keyed permission document,
 * e.g. {"org": "*"} or {"team-12": "manage"}. Mirrors the levels in the
 * backend's ROLE_PERMISSIONS (commons/rbac/rbac_utils.py).
 */
const roleFromPermissionMap = (
  permissions?: Record<string, unknown>,
): string | undefined => {
  if (!permissions) {
    return undefined;
  }

  // An org-scoped role outranks any class-scoped one by construction.
  const orgRole = permissions['org'];
  if (typeof orgRole === 'string') {
    return orgRole;
  }

  const held = Object.values(permissions).filter(
    (value): value is string => typeof value === 'string',
  );

  return ROLE_PRECEDENCE.find((candidate) => held.includes(candidate));
};

export const determineUserRole = (
  userData: UserApiResponse['data'],
): 'admin' | 'teacher' | 'student' => {
  const role =
    userData.user_permissions?.role ??
    roleFromPermissionMap(userData.attributes?.permissions);

  if (role === '*' || role === 'head' || role === 'superwise') {
    return 'admin';
  }
  if (role === 'manage' || role === 'lead') {
    return 'teacher';
  }
  if (role === 'edit' || role === 'view' || role === 'other') {
    return 'student';
  }

  // Defensive fallback if no role could be resolved at all. `attributes.role`
  // carries the faculty record's own role ("faculty", "staff", ...), which is a
  // weaker signal than the RBAC role above but still beats defaulting a member
  // of staff to 'student'.
  const userType =
    userData.user_permissions?.user_type ?? userData.attributes?.type;
  if (userType === 'faculty' || userData.attributes?.role === 'faculty') {
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
