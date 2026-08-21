import { makeApiCall } from '@/utils/ApiRequest';
import { studentApiKeyHeader } from '@/utils/authHeaders';
import { convertGoogleDriveUrl } from '@/utils/imageUtils';
import axios from 'axios';

// ---------------------------------------------------------------------------
// Error helpers
//
// Everything in here throws either an axios error (from makeApiCall) or a
// plain Error, so these narrow `catch (error: unknown)` without the casts
// that used to be spread across every handler.
// ---------------------------------------------------------------------------

/** HTTP status of a failed request, or undefined for non-HTTP failures. */
const errorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** Response body of a failed request, if the failure reached the server. */
const errorData = (error: unknown): unknown =>
  axios.isAxiosError(error) ? error.response?.data : undefined;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Message the backend sent for a failed request, falling back to the
 * transport-level message. Mirrors the JSON:API error documents these services
 * return: `{ errors: [{ detail }] }`, or a bare `{ message }`.
 */
const backendErrorMessage = (error: unknown): string => {
  const data = errorData(error);
  if (data && typeof data === 'object') {
    const doc = data as {
      errors?: Array<{ detail?: string }>;
      message?: string;
    };
    if (doc.errors?.[0]?.detail) return doc.errors[0].detail;
    if (doc.message) return doc.message;
  }
  return errorMessage(error);
};

/** The fields the error logs in this file consistently report. */
const errorDetails = (error: unknown) => ({
  message: errorMessage(error),
  status: errorStatus(error),
  statusText: axios.isAxiosError(error)
    ? error.response?.statusText
    : undefined,
  data: errorData(error),
});

// ---------------------------------------------------------------------------
// Generic JSON:API envelopes
//
// Used for the endpoints this legacy service layer never modelled. `A` is the
// resource's `attributes` shape: pass a concrete interface where callers read
// fields, and leave the default loose record where the response is only
// checked for presence.
// ---------------------------------------------------------------------------

export interface ApiResource<A = Record<string, unknown>> {
  id: string;
  type?: string;
  attributes: A;
  links?: { self?: string };
}

export interface ApiDocument<A = Record<string, unknown>> {
  data: ApiResource<A>;
  meta?: Record<string, unknown>;
}

export interface ApiCollection<A = Record<string, unknown>> {
  data: ApiResource<A>[];
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Attribute shapes for the class-service resources this layer returns.
//
// Every field is optional: these endpoints are shared with the newer RTK Query
// layer and have grown fields over time, so callers must handle absence rather
// than trust the envelope.
// ---------------------------------------------------------------------------

export interface FeeComponents {
  admission_fee?: number;
  registration_fee?: number;
  tuition_fees?: number;
  exam_fees?: number;
  other_fees?: number;
}

export interface FeePaymentRecord {
  id?: string;
  receipt_number?: string;
  date?: string;
  description?: string;
  method?: string;
  amount?: number;
  month?: string;
  remarks?: string;
  // Alternate spellings the fees endpoints have returned; callers read either.
  payment_date?: string;
  payment_method?: string;
  fee_type?: string;
}

export interface FeeAttributes {
  student_id?: string;
  student_name?: string;
  class_id?: string;
  academic_year?: string;
  amount?: number;
  components?: FeeComponents;
  fee_structure_id?: string;
  total_paid?: number;
  total_due?: number;
  remaining_amount?: number;
  amount_paid?: number;
  amount_due?: number;
  status?: string;
  payment_status?: string;
  /** Denormalised student contact, present on some fee payloads. */
  email?: string;
  phone?: string;
  due_date?: string;
  description?: string;
  fee_type?: string;
  payments?: FeePaymentRecord[];
}

export interface FeeStructureAttributes {
  class_id?: string;
  class_name?: string;
  academic_year?: string;
  components?: FeeComponents;
  total?: number;
  total_amount?: number;
}

export interface ClassStudentAttributes {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  roll_number?: string;
  email?: string;
  phone?: string;
  is_monitor?: boolean;
}

export interface SubjectAttributes {
  name?: string;
  subject_name?: string;
  code?: string;
  class_id?: string;
  teacher_id?: string;
  teacher_name?: string;
}

export interface ExamSubjectEntry {
  subject_id: string;
  subject_name?: string;
  max_marks?: number;
  exam_date?: string;
  duration?: number;
  start_time?: string;
}

export interface ExamAttributes {
  name?: string;
  exam_name?: string;
  exam_type?: string;
  exam_date?: string | number;
  max_marks?: number;
  class_id?: string;
  class_name?: string;
  academic_year?: string;
  description?: string;
  subjects?: ExamSubjectEntry[];
  /** Only the subjects the requesting teacher owns, when the route scopes it. */
  teacher_subjects?: TeacherSubjectEntry[];
}

/** A teacher's subject assignment, as embedded in a teacher-scoped exam. */
export interface TeacherSubjectEntry {
  id?: string;
  subject_id?: string;
  subject_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  class_id?: string;
  class_name?: string;
  academic_year?: string;
}

export interface ResultMarkEntry {
  subject_id: string;
  max_marks?: number;
  marks_obtained?: number;
  grade?: string;
  remarks?: string;
}

export interface ResultAttributes {
  exam_id?: string;
  student_id?: string;
  class_id?: string;
  marks?: ResultMarkEntry[];
  total_marks?: number;
  total_obtained?: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
}

export interface UserRoleAttributes {
  user_id?: string;
  name?: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

/** One day of a student's attendance: status codes are P/A/L/H. */
export interface AttendanceDay {
  date: string;
  status: string;
  student_id?: string;
}

/** `GET /{orgId}/attendance/student/{id}?month=MM-YYYY` */
export interface MonthlyAttendanceResponse {
  data: AttendanceDay[];
}

/**
 * `GET /{orgId}/attendance/class/{classId}`. `data` is null when no attendance
 * has been recorded for the class yet - see getClassAttendance, which maps the
 * backend's 404 onto that rather than throwing.
 */
export interface ClassAttendanceResponse {
  data: ApiResource<AttendanceDay | AttendanceDay[]> | null;
}

/**
 * `POST /{orgId}/{students|faculty}/bulk`. The backend isolates per-row
 * failures, so a partial success reports counts in `meta` and the rejected
 * rows in `errors`.
 */
export interface BulkImportResponse {
  meta?: { succeeded?: number; failed?: number };
  errors?: Array<{ index: number; error: string }>;
}

/**
 * PATCH body for an organization. Address and contact are sent whole - the
 * backend replaces the sub-object rather than merging it.
 */
export interface OrganizationPatch {
  name?: string;
  subdomain?: string;
  description?: string;
  founded?: number;
  address?: {
    building_street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  contact?: {
    poc_name?: string;
    poc_email?: string;
    phone?: string;
  };
}

/** Headers/params a caller can add to one of the axios-shaped wrappers below. */
interface RequestConfig {
  headers?: Record<string, string>;
  /**
   * NOTE: accepted for call-site compatibility but NOT forwarded - makeApiCall
   * has no query-param option, so callers that need a query string build it
   * into the path (see getFeeStructures).
   */
  params?: Record<string, string | number | undefined>;
}

type RequestPayload = Record<string, unknown>;

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  // Get cached data if valid. Expiry is fixed when the entry is written, so
  // reads take no ttl of their own.
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Set cache data
  set<T>(key: string, data: T, ttl: number = 30000): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  // Execute request with deduplication
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return pending as Promise<T>;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Remove from pending requests when done
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Clear specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

const apiCache = new ApiCache();

// Configuration for API endpoints
const API_CONFIG = {
  // Use external API for real endpoints
  EXTERNAL_API:
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth',
  // Use class API for class endpoints
  CLASS_API:
    process.env.NEXT_PUBLIC_BaseURLClass ||
    'https://apis.testkdlakshya.uchhal.in/class',
  // Use workspace API for workspace endpoints
  WORKSPACE_API:
    process.env.NEXT_PUBLIC_BaseURLWorkspace ||
    'https://apis.testkdlakshya.uchhal.in',
  // Use local API for mock endpoints (during development)
  LOCAL_API:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
};

// Create wrapper axios instances that use makeApiCall internally
// This maintains backward compatibility while using centralized API logic

// External API instance (for real endpoints like users/me)
const externalApi = {
  get: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'GET',
      baseUrl: 'auth',
      headers: config?.headers,
    });
    return { data: response };
  },
  post: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'POST',
      baseUrl: 'auth',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  put: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PUT',
      baseUrl: 'auth',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  patch: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PATCH',
      baseUrl: 'auth',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  delete: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'DELETE',
      baseUrl: 'auth',
      headers: config?.headers,
    });
    return { data: response };
  },
};

// Class API instance (for class endpoints)
const classApi = {
  get: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'GET',
      baseUrl: 'default',
      headers: config?.headers,
    });
    return { data: response };
  },
  post: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'POST',
      baseUrl: 'default',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  put: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PUT',
      baseUrl: 'default',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  patch: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PATCH',
      baseUrl: 'default',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  delete: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'DELETE',
      baseUrl: 'default',
      headers: config?.headers,
    });
    return { data: response };
  },
};

// Workspace API instance (for workspace endpoints like S3)
const workspaceApi = {
  get: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'GET',
      baseUrl: 'workspace',
      headers: config?.headers,
    });
    return { data: response };
  },
  post: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'POST',
      baseUrl: 'workspace',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  put: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PUT',
      baseUrl: 'workspace',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  patch: async (url: string, data?: RequestPayload, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'PATCH',
      baseUrl: 'workspace',
      payload: data,
      headers: config?.headers,
    });
    return { data: response };
  },
  delete: async (url: string, config?: RequestConfig) => {
    const response = await makeApiCall({
      path: url,
      method: 'DELETE',
      baseUrl: 'workspace',
      headers: config?.headers,
    });
    return { data: response };
  },
};

// Retry helper for handling intermittent 500 errors (Lambda cold starts)
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    const status = errorStatus(error);
    const shouldRetry = status !== undefined && status >= 500 && retries > 0;

    if (shouldRetry) {
      console.warn(
        `⚠️ Request failed with ${status}, retrying... (${retries} retries left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay * 1.5);
    }

    throw error;
  }
};

// Response type definitions
export interface OrganizationResponse {
  data: {
    type: 'organizations';
    id: string;
    attributes: {
      name: string;
      subdomain: string;
      code?: string;
      logo?: string;
      description?: string;
      founded?: number;
      address?: {
        building_street: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
      };
      contact?: {
        poc_name: string;
        poc_email: string;
        phone: string;
      };
      object_id: string;
      createdAt: number;
      updatedAt: number;
    };
  };
}

export interface SiteConfigResponse {
  data: {
    type: 'siteconfig';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      theme: {
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
      };
      seo: {
        title: string;
        description: string;
        keywords: string[];
      };
      customDomain: string;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  };
}

export interface HeroResponse {
  data: {
    type: 'hero';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      headline: string;
      subheadline: string;
      description?: string;
      ctaText: string;
      ctaLink: string;
      image: string;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  };
}

interface SingleNewsResponse {
  data: {
    type: 'news';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      title: string;
      content: string;
      image: string;
      category?: string;
      isNew?: boolean;
      isActive?: boolean;
      publishedAt: number;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  };
}

interface NewsListResponse {
  data: {
    type: 'news';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      title: string;
      content: string;
      image: string;
      category?: string;
      isNew?: boolean;
      isActive?: boolean;
      publishedAt: number;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  }[];
}

interface FacultyResponse {
  data: {
    type: 'faculty';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      name: string;
      designation: string;
      experience: number;
      role: string;
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
    };
    links: {
      self: string;
    };
  };
}

interface S3SignedUrlResponse {
  success: boolean;
  data: {
    signed_url: string;
    file_path: string;
    bucket: string;
    expires_in: number;
    upload_id?: string;
  };
}

export interface GalleryImageAttributes {
  image_url: string;
  title?: string;
  description?: string;
  tags?: string[];
  order?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage extends GalleryImageAttributes {
  id: string;
}

interface GalleryListResponse {
  data: { type: string; id: string; attributes: GalleryImageAttributes }[];
  meta?: { total: number };
}

interface GalleryItemResponse {
  data: { type: string; id: string; attributes: GalleryImageAttributes };
}

interface FacultyListResponse {
  data: {
    type: 'faculty';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      name: string;
      designation: string;
      experience: number;
      role: string;
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
    };
    links: {
      self: string;
    };
  }[];
}

export interface AboutResponse {
  data: {
    type: 'about';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      title: string;
      content: string;
      mission: string;
      vision: string;
      values: string[];
      images: string[];
      social: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
        youtube: string;
      };
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  };
}

export interface BrandingResponse {
  data: {
    type: 'branding';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      logo: string;
      favicon: string;
      banner: string;
      watermark: string;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  };
}

export interface ProgramsResponse {
  data: Array<{
    type: 'programs';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      title: string;
      description: string;
      duration: string;
      eligibility: string;
      image: string;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  }>;
}

export interface StatsResponse {
  data: Array<{
    type: 'stats';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      label: string;
      value: string;
      icon: string;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
      updated_by: string;
    };
    links: {
      self: string;
    };
  }>;
}

export interface NewsResponse {
  data: Array<{
    type: 'news';
    id: string;
    attributes: {
      id: string;
      orgId: string;
      title: string;
      content: string;
      image: string;
      category?: string;
      isNew?: boolean;
      isActive?: boolean;
      publishedAt: number;
      createdAt: number;
      updatedAt: number;
      created_by: string;
      created_by_email: string;
    };
    links: {
      self: string;
    };
  }>;
}

export interface SubdomainResponse {
  subdomain: string;
  config: {
    theme: string;
    language: string;
    /** Org this subdomain resolves to - everything downstream keys off it. */
    organizationId?: string;
    name?: string;
    founded?: number;
    contact?: { email?: string; phone?: string; address?: string };
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    [key: string]: unknown;
  };
}

// Real API user response structure
export interface RealUserResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      org: string;
      org_id?: string;
      is_active: boolean;
      created_ts: number;
      id: string;
    };
    user_permissions: {
      [key: string]: string;
    };
  };
}

export interface ContentResponse {
  title: string;
  banner: string;
  sections: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    image?: string;
    data?: { code?: string; [key: string]: unknown };
  }>;
  [key: string]: unknown;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

export interface UserInfoResponse {
  users: number;
  active: boolean;
  [key: string]: unknown;
}

export interface ClassResponse {
  data: {
    type: 'classes';
    id: string;
    attributes: {
      class: string;
      section: string;
      teacher_id?: string;
      teacher_name?: string;
      class_teacher_id?: string;
      class_teacher_name?: string;
      room: string;
      academic_year: string;
      academicYear?: string;
      description: string;
      createdAt: number;
      updatedAt: number;
    };
  };
}

export interface ClassListResponse {
  data: ClassResponse['data'][];
}

export interface StudentResponse {
  data: {
    type: 'students';
    id: string;
    attributes: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      date_of_birth: string;
      grade_level: string;
      admission_date: string;
      guardian_info: {
        father_name: string;
        mother_name: string;
        phone: string;
        email: string;
        address: string;
      };
      unique_id?: string;
      profile?: string;
      gender?: string;
      createdAt: number;
      updatedAt: number;
    };
  };
}

export interface StudentListResponse {
  data: StudentResponse['data'][];
}

export interface FetchAllDataResult {
  subdomain: SubdomainResponse;
  content: ContentResponse;
  products: Product[];
  userInfo: UserInfoResponse;
  hero?: HeroResponse;
  about?: AboutResponse;
  siteConfig?: SiteConfigResponse;
  branding?: BrandingResponse;
  programs?: ProgramsResponse;
  stats?: StatsResponse;
  news?: NewsResponse;
}

// API service functions
export class ApiService {
  // Clear cache for specific resource
  static clearCache(
    resource: 'classes' | 'students' | 'faculty' | 'user',
    orgId?: string,
  ): void {
    if (resource === 'user') {
      // Clear all user cache entries
      const keys = ['user_me'];
      keys.forEach((key) => apiCache.clear(key));
    } else if (orgId) {
      apiCache.clear(`${resource}_${orgId}`);
    }
  }

  // Clear all caches
  static clearAllCache(): void {
    apiCache.clearAll();
  }
  // Step 1: Get subdomain and base configuration (keeping for backward compatibility)
  static async getSubdomain(
    subdomain: string = 'auth',
  ): Promise<SubdomainResponse> {
    try {
      console.log(
        `Trying to fetch subdomain data from: ${API_CONFIG.EXTERNAL_API}/organizations/subdomain/${subdomain}`,
      );

      // Get organization data first
      const orgResponse = await this.getOrganization(subdomain);
      const orgId = orgResponse.data.id;

      // Get site configuration using the organization ID
      let siteConfig: SiteConfigResponse | null = null;
      try {
        siteConfig = await this.getSiteConfig(orgId);
        console.log(
          'Site config fetched successfully:',
          siteConfig.data.attributes,
        );
      } catch (configError) {
        console.warn(
          'Could not fetch site config, using defaults:',
          configError,
        );
      }

      // Transform to legacy format with site config data
      const legacyResponse: SubdomainResponse = {
        subdomain: orgResponse.data.attributes.subdomain,
        config: {
          theme: siteConfig?.data.attributes.theme.primaryColor
            ? 'custom'
            : 'default',
          language: 'en',
          organizationId: orgResponse.data.id,
          name: orgResponse.data.attributes.name,
          code: orgResponse.data.attributes.code,
          logo: orgResponse.data.attributes.logo,
          contact: orgResponse.data.attributes.contact,
          founded: orgResponse.data.attributes.founded,
          // Include site config theme data
          primaryColor:
            siteConfig?.data.attributes.theme.primaryColor || '#059669',
          secondaryColor:
            siteConfig?.data.attributes.theme.secondaryColor || '#10B981',
          fontFamily: siteConfig?.data.attributes.theme.fontFamily || 'Arial',
          // Include SEO data
          seo: siteConfig?.data.attributes.seo || {
            title: orgResponse.data.attributes.name,
            description: `Welcome to ${orgResponse.data.attributes.name}`,
            keywords: ['education', 'academy', 'learning'],
          },
          customDomain: siteConfig?.data.attributes.customDomain || '',
          siteConfigId: siteConfig?.data.id,
        },
      };

      console.log(
        'Transformed organization data with site config to legacy format:',
        legacyResponse,
      );
      return legacyResponse;
    } catch (error) {
      console.error('Error fetching subdomain data from external API:', error);

      // Check if it's an auth error even though it should be public
      if (axios.isAxiosError(error)) {
        console.log('External API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }

      throw new Error(
        'Failed to fetch subdomain configuration from external API',
      );
    }
  }

  // Step 2: Get landing page content (removed - use external API only)
  static async getContent(): Promise<ContentResponse> {
    // Content API has been removed - return empty content structure
    return {
      title: 'Educational Institution',
      banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1',
      sections: [],
    };
  }

  // Step 3: Get products/services (removed - use external API only)
  static async getProducts(): Promise<Product[]> {
    // Products API has been removed - return empty array
    return [];
  }

  // Step 4: Get user info with subdomain (removed - use external API only)
  static async getUserInfo(_subdomain: string): Promise<UserInfoResponse> {
    // User info API has been removed - return default values
    return { users: 0, active: false };
  }

  // Get organization data by subdomain
  static async getOrganization(
    subdomain: string,
  ): Promise<OrganizationResponse> {
    const cacheKey = `organization_${subdomain}`;
    const cached = apiCache.get<OrganizationResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(
          `/organizations/subdomain/${subdomain}`,
        );
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching organization data:', error);
        throw new Error('Failed to fetch organization data');
      }
    });
  }

  // Get organization data by ID
  static async getOrganizationById(
    orgId: string,
    accessToken?: string,
    isStudentAuth: boolean = false,
  ): Promise<OrganizationResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        if (isStudentAuth) {
          // Student api keys ride on Authorization too, so the gateway can use
          // that single header as the authorizer's identity source.
          Object.assign(headers, studentApiKeyHeader(accessToken));
        } else {
          // Admin/teachers use Bearer token
          headers['Authorization'] = `Bearer ${accessToken}`;
          console.log('🔑 Using Bearer token for org fetch');
        }
      }

      const response = await externalApi.get(`/organizations/${orgId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching organization data by ID:', error);
      throw new Error('Failed to fetch organization data by ID');
    }
  }

  // Update organization data by ID
  static async updateOrganization(
    orgId: string,
    organizationData: OrganizationPatch,
  ): Promise<OrganizationResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'organizations',
          id: orgId,
          attributes: organizationData,
        },
      };

      console.log(`Making PATCH request to: /organizations/${orgId}`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.patch(
        `/organizations/${orgId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error('Failed to update organization data');
    }
  }

  // Helper method to get current organization ID from user data or subdomain with sessionStorage caching
  static async getCurrentOrgId(): Promise<string> {
    try {
      // Priority 0: For localhost development, use hardcoded orgId
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost =
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('localhost:');
        if (isLocalhost) {
          const localhostOrgId = '68d6b128d88f00c8b1b4a89a';
          console.log('🏠 Using hardcoded localhost orgId:', localhostOrgId);
          return localhostOrgId;
        }
      }

      // Priority 1: Check cachedUserData in localStorage (set by useUserData hook)
      if (typeof window !== 'undefined') {
        const cachedUserData = localStorage.getItem('cachedUserData');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            if (userData.orgId) {
              console.log(
                '✅ Using orgId from cachedUserData:',
                userData.orgId,
              );
              return userData.orgId;
            }
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }
      }

      // Priority 2: Check sessionStorage cache (from sessionStorage.userData)
      if (typeof window !== 'undefined') {
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
          try {
            const userData = JSON.parse(sessionUserData);
            if (userData.orgId) {
              console.log(
                '✅ Using orgId from sessionStorage userData:',
                userData.orgId,
              );
              return userData.orgId;
            }
          } catch (e) {
            console.error('Error parsing session user data:', e);
          }
        }
      }

      // Priority 3: Check standalone orgId cache in sessionStorage
      if (typeof window !== 'undefined') {
        const cachedOrgId = sessionStorage.getItem('currentOrgId');
        if (cachedOrgId) {
          console.log('✅ Using orgId from sessionStorage cache:', cachedOrgId);
          return cachedOrgId;
        }
      }

      // Priority 4 (AVOID IF POSSIBLE): If we have a bearer token, fetch user data to get org ID
      // This should only happen on first page load before any caching is set up
      if (typeof window !== 'undefined') {
        const tokenStr = localStorage.getItem('bearerToken');
        if (tokenStr) {
          try {
            const tokenItem = JSON.parse(tokenStr);
            const now = new Date().getTime();

            if (now < tokenItem.expiry && tokenItem.value) {
              console.warn('⚠️ Fetching user data to get orgId (cache miss)');
              const userResponse = await this.getUserMe(tokenItem.value);
              const userData = userResponse.data;
              const orgId =
                userData.attributes.org_id || userData.attributes.org;

              if (orgId) {
                // Cache the org ID for future use in multiple places
                sessionStorage.setItem('currentOrgId', orgId);
                console.log('📝 Cached orgId for future use:', orgId);
                return orgId;
              }
            }
          } catch (error) {
            console.error('Error fetching user data to get org ID:', error);
            // Continue to fallback method
          }
        }
      }

      // Priority 5 (Fallback): Get subdomain from current URL
      let subdomain = '';

      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Handle localhost development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          subdomain = 'auth'; // Default subdomain for localhost development
        } else if (hostname.endsWith('.localhost')) {
          // Handle *.localhost domains (e.g., amity.localhost)
          subdomain = hostname.split('.localhost')[0];
        } else {
          // Extract subdomain from production URL (e.g., 'auth' from 'auth.uchhal.in')
          const parts = hostname.split('.');
          if (parts.length > 2) {
            subdomain = parts[0];
          } else if (parts.length === 2) {
            // Fallback: use first part if only 2 parts
            subdomain = parts[0];
          }
        }
      }

      if (!subdomain) {
        throw new Error(
          `No subdomain found in URL. Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'server-side'}`,
        );
      }

      // Use existing getSubdomain method which returns config with organizationId
      const subdomainData = await this.getSubdomain(subdomain);
      const orgId = subdomainData.config.organizationId;

      if (!orgId) {
        throw new Error('Organization ID not found in subdomain config');
      }

      // Cache the organization ID in sessionStorage for future use
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentOrgId', orgId);
      }

      return orgId;
    } catch (error) {
      console.error('Error getting current organization ID:', error);
      throw new Error(
        `Failed to get current organization ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Get site configuration by organization ID
  static async getSiteConfig(orgId: string): Promise<SiteConfigResponse> {
    const cacheKey = `siteconfig_${orgId}`;
    const cached = apiCache.get<SiteConfigResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/siteconfig`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching site config:', error);
        throw new Error('Failed to fetch site configuration');
      }
    });
  }

  // Update site configuration by organization ID
  static async updateSiteConfig(
    orgId: string,
    siteConfigData: {
      theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
      };
      seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
      };
      customDomain?: string;
    },
  ): Promise<SiteConfigResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'siteconfigs',
          attributes: siteConfigData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/siteconfig`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(
        `/${orgId}/siteconfig`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating site config:', error);
      throw new Error('Failed to update site configuration');
    }
  }

  // Get about section data by organization ID
  static async getAbout(orgId: string): Promise<AboutResponse> {
    const cacheKey = `about_${orgId}`;
    const cached = apiCache.get<AboutResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/about`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching about data:', error);
        throw new Error('Failed to fetch about section data');
      }
    });
  }

  // Update about section data by organization ID
  static async updateAbout(
    orgId: string,
    aboutData: {
      title: string;
      content: string;
      mission: string;
      vision: string;
      values: string[];
      images?: string[];
      social?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
      };
    },
  ): Promise<AboutResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'about',
          attributes: aboutData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/about`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(`/${orgId}/about`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating about data:', error);
      throw new Error('Failed to update about section data');
    }
  }

  // Get hero section data by organization ID
  static async getHero(orgId: string): Promise<HeroResponse> {
    const cacheKey = `hero_${orgId}`;
    const cached = apiCache.get<HeroResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/hero`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching hero data:', error);
        throw new Error('Failed to fetch hero section data');
      }
    });
  }

  // Update hero section data by organization ID
  static async updateHero(
    orgId: string,
    heroData: {
      headline: string;
      subheadline: string;
      description?: string;
      ctaText: string;
      ctaLink: string;
      image: string;
    },
  ): Promise<HeroResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'hero',
          attributes: heroData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/hero`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(`/${orgId}/hero`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating hero data:', error);
      throw new Error('Failed to update hero section data');
    }
  }

  // Get branding data by organization ID
  static async getBranding(orgId: string): Promise<BrandingResponse> {
    const cacheKey = `branding_${orgId}`;
    const cached = apiCache.get<BrandingResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/branding`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching branding data:', error);
        throw new Error('Failed to fetch branding data');
      }
    });
  }

  // Update branding data by organization ID
  static async updateBranding(
    orgId: string,
    brandingData: {
      logo: string;
      favicon?: string;
      banner?: string;
      watermark?: string;
    },
  ): Promise<BrandingResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'branding',
          attributes: brandingData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/branding`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(
        `/${orgId}/branding`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating branding data:', error);
      throw new Error('Failed to update branding section data');
    }
  }

  // Create news item
  static async createNews(
    orgId: string,
    newsData: {
      title: string;
      content: string;
      image: string;
      category?: string;
      isNew?: boolean;
      isActive?: boolean;
      publishedAt?: number;
    },
  ): Promise<SingleNewsResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'news',
          attributes: {
            ...newsData,
            publishedAt: newsData.publishedAt || Math.floor(Date.now() / 1000),
          },
        },
      };

      console.log(`Making POST request to: /${orgId}/news`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.post(`/${orgId}/news`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error('Failed to create news item');
    }
  }

  // Get single news item
  static async getNewsItem(
    orgId: string,
    newsId: string,
  ): Promise<SingleNewsResponse> {
    try {
      const response = await externalApi.get(`/${orgId}/news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw new Error('Failed to fetch news item');
    }
  }

  // Update news item
  static async updateNews(
    orgId: string,
    newsId: string,
    newsData: {
      title?: string;
      content?: string;
      image?: string;
      category?: string;
      isNew?: boolean;
      isActive?: boolean;
      publishedAt?: number;
    },
  ): Promise<SingleNewsResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'news',
          attributes: newsData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/news/${newsId}`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(
        `/${orgId}/news/${newsId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating news:', error);
      throw new Error('Failed to update news item');
    }
  }

  // Delete news item
  static async deleteNews(orgId: string, newsId: string): Promise<void> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      console.log(`Making DELETE request to: /${orgId}/news/${newsId}`);

      await externalApi.delete(`/${orgId}/news/${newsId}`, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });

      console.log('News item deleted successfully');
    } catch (error) {
      console.error('Error deleting news:', error);
      throw new Error('Failed to delete news item');
    }
  }

  // Get all faculty members by organization ID (excludes staff)
  static async getFaculty(orgId: string): Promise<FacultyListResponse> {
    const cacheKey = `faculty_${orgId}`;

    // Check cache first (1 min TTL for faculty)
    const cached = apiCache.get<FacultyListResponse>(cacheKey);
    if (cached) {
      console.log('✅ Using cached faculty data');
      return cached;
    }

    // Deduplicate concurrent requests
    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/faculty`);

        // Filter to return only faculty members (exclude staff)
        const filteredData = {
          ...response.data,
          data: (response.data.data as ApiResource<{ role?: string }>[]).filter(
            (member) => member.attributes.role === 'faculty',
          ),
        };

        console.log(
          `📚 Filtered ${response.data.data.length} total members to ${filteredData.data.length} faculty (excluding staff)`,
        );

        // Cache the filtered result
        apiCache.set(cacheKey, filteredData, 60000);
        return filteredData;
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        throw new Error('Failed to fetch faculty data');
      }
    });
  }

  // Create new faculty member
  static async createFaculty(
    orgId: string,
    facultyData: {
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
    },
  ): Promise<FacultyResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      // Ensure all required fields are present
      const completeAttributes = {
        ...facultyData,
        experience: facultyData.experience || 1, // Default to 1 year if not provided
        role: facultyData.role || 'faculty', // Default role
        temporary_password: facultyData.temporary_password || 'TempPass123!', // Default temp password
      };

      const requestBody = {
        data: {
          type: 'faculty',
          attributes: completeAttributes,
        },
      };

      console.log(`Making POST request to: /${orgId}/faculty`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.post(
        `/${orgId}/faculty`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      // Invalidate faculty cache
      this.clearCache('faculty', orgId);
      return response.data;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw new Error('Failed to create faculty member');
    }
  }

  // Get S3 signed URL for file upload
  static async getS3SignedUrl(
    userId: string,
    title: string,
    role: string,
  ): Promise<S3SignedUrlResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        type: 'upload',
        id: userId,
        attributes: {
          title: title,
          role: role,
        },
      };

      const response = await workspaceApi.post('/s3/signed-url', requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting S3 signed URL:', error);
      throw new Error('Failed to get S3 signed URL');
    }
  }

  // Upload file to S3 using signed URL
  static async uploadFileToS3(signedUrl: string, file: File): Promise<void> {
    try {
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Get a signed S3 upload URL for an org-wide image (gallery, hero, about, favicon, logo)
  static async getOrgImageSignedUrl(
    userId: string,
    imageType: 'gallery' | 'hero' | 'about' | 'favicon' | 'logo',
  ): Promise<S3SignedUrlResponse> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }
      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();
      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        type: 'upload',
        id: userId,
        attributes: {
          title: 'org_image',
          image_type: imageType,
        },
      };

      const response = await workspaceApi.post('/s3/signed-url', requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting org image signed URL:', error);
      throw new Error('Failed to get S3 signed URL');
    }
  }

  // Get all gallery images for an org (public endpoint, no auth required)
  static async getGalleryImages(orgId: string): Promise<GalleryImage[]> {
    try {
      const response = await externalApi.get(`/${orgId}/gallery`);
      const body = response.data as GalleryListResponse;
      return (body.data || []).map((item) => ({
        id: item.id,
        ...item.attributes,
      }));
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw new Error('Failed to fetch gallery images');
    }
  }

  // Create a gallery image record pointing at an already-uploaded file (admin only)
  static async createGalleryImage(
    orgId: string,
    attributes: GalleryImageAttributes,
  ): Promise<GalleryImage> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }
      const tokenItem = JSON.parse(tokenStr);

      const response = await externalApi.post(
        `/${orgId}/gallery`,
        { data: { type: 'gallery_image', attributes } },
        { headers: { Authorization: `Bearer ${tokenItem.value}` } },
      );
      const body = response.data as GalleryItemResponse;
      return { id: body.data.id, ...body.data.attributes };
    } catch (error) {
      console.error('Error creating gallery image:', error);
      throw new Error('Failed to create gallery image');
    }
  }

  // Finalize a gallery image after an S3 upload, attaching metadata to the upload_id
  static async updateGalleryImageByUploadId(
    orgId: string,
    uploadId: string,
    attributes: GalleryImageAttributes,
  ): Promise<GalleryImage> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }
      const tokenItem = JSON.parse(tokenStr);

      const response = await externalApi.put(
        `/${orgId}/gallery/upload/${uploadId}`,
        { data: { type: 'gallery_image', attributes } },
        { headers: { Authorization: `Bearer ${tokenItem.value}` } },
      );
      const body = response.data as GalleryItemResponse;
      return { id: body.data.id, ...body.data.attributes };
    } catch (error) {
      console.error('Error finalizing gallery image:', error);
      throw new Error('Failed to save gallery image');
    }
  }

  // Toggle active/inactive or edit metadata for an existing gallery image
  static async updateGalleryImage(
    orgId: string,
    galleryId: string,
    attributes: Partial<GalleryImageAttributes>,
  ): Promise<GalleryImage> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }
      const tokenItem = JSON.parse(tokenStr);

      const response = await externalApi.put(
        `/${orgId}/gallery/${galleryId}`,
        { data: { type: 'gallery_image', attributes } },
        { headers: { Authorization: `Bearer ${tokenItem.value}` } },
      );
      const body = response.data as GalleryItemResponse;
      return { id: body.data.id, ...body.data.attributes };
    } catch (error) {
      console.error('Error updating gallery image:', error);
      throw new Error('Failed to update gallery image');
    }
  }

  // Delete a gallery image (admin only)
  static async deleteGalleryImage(
    orgId: string,
    galleryId: string,
  ): Promise<void> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }
      const tokenItem = JSON.parse(tokenStr);

      await externalApi.delete(`/${orgId}/gallery/${galleryId}`, {
        headers: { Authorization: `Bearer ${tokenItem.value}` },
      });
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      throw new Error('Failed to delete gallery image');
    }
  }

  // Get programs data by organization ID
  static async getPrograms(orgId: string): Promise<ProgramsResponse> {
    const cacheKey = `programs_${orgId}`;
    const cached = apiCache.get<ProgramsResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/programs`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching programs data:', error);
        throw new Error('Failed to fetch programs data');
      }
    });
  }

  // Get stats data by organization ID
  static async getStats(orgId: string): Promise<StatsResponse> {
    const cacheKey = `stats_${orgId}`;
    const cached = apiCache.get<StatsResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/stats`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching stats data:', error);
        throw new Error('Failed to fetch stats data');
      }
    });
  }

  // Create statistic
  static async createStat(
    orgId: string,
    statData: {
      label: string;
      value: string;
      icon: string;
    },
  ): Promise<{ data: StatsResponse['data'][0] }> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'stats',
          attributes: statData,
        },
      };

      console.log(`Making POST request to: /${orgId}/stats`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.post(`/${orgId}/stats`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating statistic:', error);
      throw new Error('Failed to create statistic');
    }
  }

  // Update statistic
  static async updateStat(
    orgId: string,
    statId: string,
    statData: {
      label: string;
      value: string;
      icon: string;
    },
  ): Promise<{ data: StatsResponse['data'][0] }> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'stats',
          attributes: statData,
        },
      };

      console.log(`Making PUT request to: /${orgId}/stats/${statId}`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(
        `/${orgId}/stats/${statId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating statistic:', error);
      throw new Error('Failed to update statistic');
    }
  }

  static async deleteStat(orgId: string, statId: string): Promise<void> {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      throw new Error('No authentication token found');
    }

    const tokenItem = JSON.parse(tokenStr);
    const now = new Date().getTime();

    if (now > tokenItem.expiry) {
      localStorage.removeItem('bearerToken');
      throw new Error('Authentication token has expired');
    }

    await externalApi.delete(`/${orgId}/stats/${statId}`, {
      headers: {
        Authorization: `Bearer ${tokenItem.value}`,
      },
    });
  }

  // Get news/notifications data by organization ID
  static async getNews(orgId: string): Promise<NewsListResponse> {
    const cacheKey = `news_${orgId}`;
    const cached = apiCache.get<NewsListResponse>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        const response = await externalApi.get(`/${orgId}/news`);
        apiCache.set(cacheKey, response.data, 300000);
        return response.data;
      } catch (error) {
        console.error('Error fetching news data:', error);
        throw new Error('Failed to fetch news/notifications data');
      }
    });
  }

  // Additional method to get user data (using the real API structure)
  static async getUserMe(token: string): Promise<RealUserResponse> {
    const cacheKey = `user_me_${token.substring(0, 10)}`;

    // Check cache first (5 min TTL for user data)
    const cached = apiCache.get<RealUserResponse>(cacheKey);
    if (cached) {
      console.log('✅ Using cached user data');
      return cached;
    }

    // Deduplicate concurrent requests
    return apiCache.dedupe(cacheKey, async () => {
      return retryRequest(async () => {
        try {
          const response = await externalApi.get(
            '/users/me?include=permission',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          // Cache the result
          apiCache.set(cacheKey, response.data, 300000);
          return response.data;
        } catch (error) {
          console.error('Error fetching user data:', error);
          throw error; // Let retryRequest handle the retry logic
        }
      });
    });
  }

  // Get all classes by organization ID
  static async getClasses(orgId: string): Promise<ClassListResponse> {
    console.log('🔵 ApiService.getClasses called with orgId:', orgId);

    if (!orgId || orgId === 'undefined') {
      console.error('❌ Invalid orgId provided to getClasses:', orgId);
      throw new Error(
        'Invalid orgId: orgId is required and cannot be undefined',
      );
    }

    const cacheKey = `classes_${orgId}`;

    // Check cache first (30 sec TTL for classes)
    const cached = apiCache.get<ClassListResponse>(cacheKey);
    if (cached) {
      console.log('✅ Using cached classes data');
      return cached;
    }

    console.log('📡 Making API request to fetch classes...');

    // Deduplicate concurrent requests
    return apiCache.dedupe(cacheKey, async () => {
      return retryRequest(async () => {
        try {
          // Get authentication token
          const tokenStr = localStorage.getItem('bearerToken');
          if (!tokenStr) {
            console.error('❌ No bearerToken found in localStorage');
            throw new Error('No authentication token found');
          }

          console.log('🔑 Found bearer token in localStorage');

          const tokenItem = JSON.parse(tokenStr);
          const now = new Date().getTime();

          if (now > tokenItem.expiry) {
            console.error('❌ Bearer token has expired');
            localStorage.removeItem('bearerToken');
            throw new Error('Authentication token has expired');
          }

          console.log(`🌐 Making GET request to: /${orgId}/classes`);
          console.log('🔐 Using classApi baseURL:', API_CONFIG.CLASS_API);

          const response = await classApi.get(`/${orgId}/classes`, {
            headers: {
              Authorization: `Bearer ${tokenItem.value}`,
            },
          });

          console.log(
            '✅ Classes API response received:',
            response.data.data?.length || 0,
            'classes',
          );

          // Cache the result
          apiCache.set(cacheKey, response.data, 30000);
          return response.data;
        } catch (error) {
          console.error('❌ Error fetching classes:', error);
          console.error('Error details:', errorDetails(error));
          throw error; // Let retryRequest handle the retry
        }
      });
    });
  }

  // Create new class
  static async createClass(
    orgId: string,
    classData: {
      class: string;
      section: string;
      teacher_id?: string;
      room: string;
      academic_year: string;
      description?: string;
    },
  ): Promise<ClassResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'classes',
          attributes: classData,
        },
      };

      console.log(`Making POST request to: /${orgId}/classes`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await classApi.post(`/${orgId}/classes`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      console.log('API response:', response.data);
      // Invalidate classes cache
      this.clearCache('classes', orgId);
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw new Error('Failed to create class');
    }
  }

  // Update class
  static async updateClass(
    orgId: string,
    classId: string,
    classData: {
      class?: string;
      section?: string;
      teacher_id?: string | null;
      room?: string;
      academic_year?: string;
      description?: string;
    },
  ): Promise<ClassResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'classes',
          attributes: classData,
        },
      };

      const response = await classApi.patch(
        `/${orgId}/classes/${classId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      // Invalidate classes cache
      this.clearCache('classes', orgId);
      return response.data;
    } catch (error) {
      console.error('Error updating class:', error);
      throw new Error('Failed to update class');
    }
  }

  // Delete class
  static async deleteClass(orgId: string, classId: string): Promise<void> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      await classApi.delete(`/${orgId}/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });

      // Invalidate classes cache
      this.clearCache('classes', orgId);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw new Error('Failed to delete class');
    }
  }

  // Get students enrolled in a specific class
  static async getClassStudents(
    orgId: string,
    classId: string,
  ): Promise<ApiCollection<ClassStudentAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/classes/${classId}/students`,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching class students:', error);
      throw new Error('Failed to fetch class students');
    }
  }

  // Get all fees for students in a class
  static async getClassFees(
    orgId: string,
    classId: string,
    params?: {
      status?: 'pending' | 'partial' | 'completed';
      academic_year?: string;
    },
  ): Promise<ApiCollection<FeeAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(`/${orgId}/classes/${classId}/fees`, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
        params: params || {},
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class fees:', error);
      throw new Error('Failed to fetch class fees');
    }
  }

  // Get fee summary for organization or class
  // If classId is provided, gets summary for that class: /{orgId}/classes/{classId}/fees/summary
  // If classId is not provided, gets org-wide summary: /{orgId}/fees/summary
  static async getFeeSummary(
    orgId: string,
    classId?: string,
  ): Promise<ApiDocument> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      // Build endpoint path
      const endpoint = classId
        ? `/${orgId}/classes/${classId}/fees/summary`
        : `/${orgId}/fees/summary`;

      const response = await classApi.get(endpoint, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fee summary:', error);
      throw new Error('Failed to fetch fee summary');
    }
  }

  // Get all fee structures for an organization
  static async getFeeStructures(
    orgId: string,
    params?: {
      academic_year?: string;
    },
  ): Promise<ApiCollection<FeeStructureAttributes>> {
    try {
      // Build query string from params
      const queryString = params?.academic_year
        ? `?academic_year=${encodeURIComponent(params.academic_year)}`
        : '';

      return await makeApiCall({
        path: `/${orgId}/fee-structures${queryString}`,
        method: 'GET',
        baseUrl: 'default',
      });
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      throw new Error('Failed to fetch fee structures');
    }
  }

  // Create fee structure for a class
  static async createFeeStructure(
    orgId: string,
    classId: string,
    feeStructureData: {
      class_name: string;
      academic_year: string;
      components: {
        admission_fee: number;
        registration_fee: number;
        tuition_fees: number;
        exam_fees: number;
        other_fees: number;
      };
    },
  ): Promise<ApiDocument<FeeStructureAttributes>> {
    try {
      return await makeApiCall({
        path: `/${orgId}/classes/${classId}/fee-structures`,
        method: 'POST',
        baseUrl: 'default',
        payload: {
          data: {
            attributes: feeStructureData,
          },
        },
      });
    } catch (error) {
      console.error('Error creating fee structure:', error);
      throw new Error('Failed to create fee structure');
    }
  }

  // Update fee structure
  static async updateFeeStructure(
    orgId: string,
    feeStructureId: string,
    feeStructureData: {
      class_name: string;
      academic_year: string;
      components: {
        admission_fee: number;
        registration_fee: number;
        tuition_fees: number;
        exam_fees: number;
        other_fees: number;
      };
    },
  ): Promise<ApiDocument<FeeStructureAttributes>> {
    try {
      return await makeApiCall({
        path: `/${orgId}/fee-structures/${feeStructureId}`,
        method: 'PUT',
        baseUrl: 'default',
        payload: {
          data: {
            attributes: feeStructureData,
          },
        },
      });
    } catch (error) {
      console.error('Error updating fee structure:', error);
      throw new Error('Failed to update fee structure');
    }
  }

  // Delete fee structure
  static async deleteFeeStructure(
    orgId: string,
    feeStructureId: string,
  ): Promise<unknown> {
    try {
      return await makeApiCall({
        path: `/${orgId}/fee-structures/${feeStructureId}`,
        method: 'DELETE',
        baseUrl: 'default',
      });
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      throw new Error('Failed to delete fee structure');
    }
  }

  // Update fee details
  static async updateFee(
    orgId: string,
    feeId: string,
    feeData: {
      amount?: number;
      due_date?: string;
      description?: string;
      fee_type?: string;
    },
  ): Promise<ApiDocument<FeeAttributes>> {
    try {
      return await makeApiCall({
        path: `/${orgId}/fees/${feeId}`,
        method: 'PUT',
        baseUrl: 'default',
        payload: {
          data: {
            attributes: feeData,
          },
        },
      });
    } catch (error) {
      console.error('Error updating fee:', error);
      throw new Error('Failed to update fee');
    }
  }

  // Create/assign a fee for a student
  static async createStudentFee(
    orgId: string,
    classId: string,
    studentId: string,
    feeData: {
      fee_structure_id?: string;
      components?: {
        admission_fee: number;
        registration_fee: number;
        tuition_fees: number;
        exam_fees: number;
        other_fees: number;
      };
      academic_year: string;
      due_date: string;
      description?: string;
      fee_type?: string;
    },
  ): Promise<ApiDocument<FeeAttributes>> {
    try {
      return await makeApiCall({
        path: `/${orgId}/classes/${classId}/students/${studentId}/fees`,
        method: 'POST',
        baseUrl: 'default',
        payload: {
          data: {
            attributes: feeData,
          },
        },
      });
    } catch (error) {
      console.error('Error creating student fee:', error);
      throw new Error('Failed to create student fee');
    }
  }

  // Record a payment for a fee
  static async recordPayment(
    orgId: string,
    feeId: string,
    paymentData: {
      amount: number;
      date: string;
      receipt_number: string;
      method: string;
      description: string;
      month?: string;
      remarks?: string;
    },
  ): Promise<ApiDocument<FeeAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.post(
        `/${orgId}/fees/${feeId}/payments`,
        {
          data: {
            attributes: paymentData,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw new Error('Failed to record payment');
    }
  }

  // Update a payment
  static async updatePayment(
    orgId: string,
    feeId: string,
    paymentId: string,
    paymentData: {
      amount?: number;
      date?: string;
      receipt_number?: string;
      method?: string;
      description?: string;
      month?: string;
      remarks?: string;
    },
  ): Promise<ApiDocument<FeeAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.put(
        `/${orgId}/fees/${feeId}/payments/${paymentId}`,
        {
          data: {
            attributes: paymentData,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment');
    }
  }

  // Delete a payment
  static async deletePayment(
    orgId: string,
    feeId: string,
    paymentId: string,
  ): Promise<unknown> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.delete(
        `/${orgId}/fees/${feeId}/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw new Error('Failed to delete payment');
    }
  }

  // Get all fees for a specific student
  static async getStudentFees(
    orgId: string,
    studentId: string,
    params?: {
      status?: 'pending' | 'partial' | 'completed';
      academic_year?: string;
    },
  ): Promise<ApiCollection<FeeAttributes>> {
    try {
      // Check for student authentication (uses x-api-key instead of Bearer token)
      let customAuthHeaders: Record<string, string> | undefined;
      const studentAuthStr = localStorage.getItem('studentAuth');
      if (studentAuthStr) {
        const studentAuth = JSON.parse(studentAuthStr);
        if (studentAuth.basicAuthToken) {
          customAuthHeaders = studentApiKeyHeader(studentAuth.basicAuthToken);
        }
      }
      // If no student auth, makeApiCall will automatically use Bearer token from Redux

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.academic_year) {
        queryParams.append('academic_year', params.academic_year);
      }

      const queryString = queryParams.toString();
      const url = `/${orgId}/students/${studentId}/fees${queryString ? `?${queryString}` : ''}`;

      return await makeApiCall({
        path: url,
        method: 'GET',
        baseUrl: 'default',
        customAuthHeaders,
      });
    } catch (error) {
      console.error('Error fetching student fees:', error);
      throw new Error('Failed to fetch student fees');
    }
  }

  // Enroll a student in a class
  static async enrollStudentInClass(
    orgId: string,
    classId: string,
    enrollmentData: {
      student_id: string;
      roll_number: string;
      academic_year: string;
    },
  ): Promise<ApiDocument<ClassStudentAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'enrollment',
          attributes: enrollmentData,
        },
      };

      const response = await classApi.post(
        `/${orgId}/classes/${classId}/students`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error enrolling student in class:', error);
      throw new Error('Failed to enroll student in class');
    }
  }

  // Unenroll a student from a class
  static async unenrollStudentFromClass(
    orgId: string,
    classId: string,
    studentId: string,
    academicYear: string,
  ): Promise<void> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      await classApi.delete(
        `/${orgId}/classes/${classId}/students/${studentId}?academic_year=${encodeURIComponent(academicYear)}`,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
    } catch (error) {
      console.error('Error unenrolling student from class:', error);
      throw new Error('Failed to unenroll student from class');
    }
  }

  // Create a new subject
  static async createSubject(
    orgId: string,
    subjectData: {
      subject_name: string;
      class_id: string;
      teacher_id: string;
    },
  ): Promise<ApiDocument<SubjectAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'subjects',
          attributes: subjectData,
        },
      };

      const response = await classApi.post(`/${orgId}/subjects`, requestBody, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw new Error('Failed to create subject');
    }
  }

  // Get all subjects for a specific class
  static async getSubjectsForClass(
    orgId: string,
    classId: string,
  ): Promise<ApiCollection<SubjectAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/subjects/class/${classId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching class subjects:', error);
      throw new Error('Failed to fetch class subjects');
    }
  }

  // Update a subject
  static async updateSubject(
    orgId: string,
    subjectId: string,
    teacherId: string,
  ): Promise<ApiDocument<SubjectAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.put(
        `/${orgId}/subjects/${subjectId}`,
        {
          data: {
            type: 'subjects',
            attributes: {
              teacher_id: teacherId,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw new Error('Failed to update subject');
    }
  }

  // Delete a subject
  static async deleteSubject(orgId: string, subjectId: string): Promise<void> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      await classApi.delete(`/${orgId}/subjects/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw new Error('Failed to delete subject');
    }
  }

  // Create a new exam
  static async createExam(
    orgId: string,
    examData: {
      exam_name: string;
      class_id: string;
      exam_date: string;
      subjects: Array<{
        subject_id: string;
        subject_name?: string;
        max_marks: number;
        exam_date?: string;
        duration?: number;
        start_time?: string;
      }>;
    },
  ): Promise<ApiDocument<ExamAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.post(
        `/${orgId}/exams`,
        {
          data: {
            type: 'exams',
            attributes: examData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      // Preserve backend error message if available
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to create exam: ${backendMessage}`);
    }
  }

  // Get all exams for a specific class
  static async getExamsForClass(
    orgId: string,
    classId: string,
  ): Promise<ApiCollection<ExamAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/classes/${classId}/exams`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching exams for class:', error);

      // Check for CORS error
      if (
        errorMessage(error).includes('CORS') ||
        (axios.isAxiosError(error) && error.code === 'ERR_NETWORK')
      ) {
        console.error(
          '❌ CORS error detected. API Gateway needs CORS configuration.',
        );
        // Return empty data instead of throwing to prevent page crash
        return { data: [] };
      }

      // Preserve backend error message if available
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch exams for class: ${backendMessage}`);
    }
  }

  // Get all exams for an organization
  static async getExams(orgId: string): Promise<ApiCollection<ExamAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(`/${orgId}/exams`, {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw new Error('Failed to fetch exams');
    }
  }

  // Update an exam
  static async updateExam(
    orgId: string,
    examId: string,
    examData: {
      exam_name?: string;
      class_id?: string;
      exam_date?: string;
      subjects?: Array<{
        subject_id: string;
        subject_name?: string;
        max_marks: number;
        exam_date?: string;
        duration?: number;
        start_time?: string;
      }>;
    },
  ): Promise<ApiDocument<ExamAttributes>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.put(
        `/${orgId}/exams/${examId}`,
        {
          data: {
            type: 'exams',
            attributes: examData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      // Preserve backend error message if available
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to update exam: ${backendMessage}`);
    }
  }

  // Delete an exam
  static async deleteExam(orgId: string, examId: string): Promise<void> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      await classApi.delete(`/${orgId}/exams/${examId}`, {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      // Preserve backend error message if available
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to delete exam: ${backendMessage}`);
    }
  }

  // Get class by ID
  static async getClassById(
    orgId: string,
    classId: string,
  ): Promise<ClassResponse> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(`/${orgId}/classes/${classId}`, {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch class: ${backendMessage}`);
    }
  }

  // Get teacher's assigned subjects in a class
  static async getTeacherSubjectsInClass(
    orgId: string,
    teacherId: string,
    classId: string,
  ): Promise<ApiCollection<SubjectAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/subjects/class/${classId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );

      // Filter subjects assigned to this teacher
      const subjects = response.data.data as Array<
        ApiResource<SubjectAttributes> & {
          relationships?: { teachers?: { data?: Array<{ id: string }> } };
        }
      >;
      const teacherSubjects = subjects.filter((subject) => {
        const teachers = subject.relationships?.teachers?.data || [];
        return teachers.some((t) => t.id === teacherId);
      });

      return { data: teacherSubjects };
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch teacher subjects: ${backendMessage}`);
    }
  }

  // Get all exams for a teacher
  static async getTeacherExams(
    orgId: string,
    teacherId: string,
  ): Promise<ApiCollection<ExamAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/exams/teacher/${teacherId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher exams:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch teacher exams: ${backendMessage}`);
    }
  }

  // Get exam by ID
  static async getExamById(
    orgId: string,
    examId: string,
  ): Promise<ApiDocument<ExamAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(`/${orgId}/exams/${examId}`, {
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch exam: ${backendMessage}`);
    }
  }

  // Enter marks for student(s)
  static async createResult(
    orgId: string,
    resultData: {
      student_id: string;
      exam_id: string;
      marks: Array<{
        subject_id: string;
        marks_obtained: number;
        updated_by: string;
      }>;
    },
  ): Promise<ApiDocument<ResultAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.post(
        `/${orgId}/results`,
        {
          data: {
            type: 'results',
            attributes: resultData,
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error creating result:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to create result: ${backendMessage}`);
    }
  }

  // Update marks for a subject
  static async updateResult(
    orgId: string,
    resultId: string,
    subjectId: string,
    marksObtained: number,
    updatedBy: string,
  ): Promise<ApiDocument<ResultAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.put(
        `/${orgId}/results/${resultId}/subjects/${subjectId}`,
        {
          data: {
            type: 'results',
            attributes: {
              marks_obtained: marksObtained,
              updated_by: updatedBy,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating result:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to update result: ${backendMessage}`);
    }
  }

  // Get results for exam and subject
  static async getResultsForExamSubject(
    orgId: string,
    examId: string,
    subjectId: string,
  ): Promise<ApiCollection<ResultAttributes>> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/results/exam/${examId}/subject/${subjectId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            Authorization: `Bearer ${tokenItem.value}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch results: ${backendMessage}`);
    }
  }

  // Get student result for a specific exam
  static async getStudentResultForExam(
    orgId: string,
    studentId: string,
    examId: string,
  ): Promise<ApiDocument<ResultAttributes>> {
    try {
      // Get student authentication token
      const studentAuthStr = localStorage.getItem('studentAuth');
      if (!studentAuthStr) {
        throw new Error('No student authentication found');
      }

      const studentAuth = JSON.parse(studentAuthStr);
      const basicAuthToken = studentAuth.basicAuthToken;

      if (!basicAuthToken) {
        throw new Error('No authentication token found');
      }

      const response = await classApi.get(
        `/${orgId}/results/student/${studentId}/exam/${examId}`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            ...studentApiKeyHeader(basicAuthToken),
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching student result for exam:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch student result: ${backendMessage}`);
    }
  }

  // Get all exams for a student's class
  static async getExamsForStudentClass(
    orgId: string,
    classId: string,
  ): Promise<ApiCollection<ExamAttributes>> {
    try {
      // Get student authentication token
      const studentAuthStr = localStorage.getItem('studentAuth');
      if (!studentAuthStr) {
        throw new Error('No student authentication found');
      }

      const studentAuth = JSON.parse(studentAuthStr);
      const basicAuthToken = studentAuth.basicAuthToken;

      if (!basicAuthToken) {
        throw new Error('No authentication token found');
      }

      const response = await classApi.get(
        `/${orgId}/classes/${classId}/exams`,
        {
          headers: {
            'Content-Type': 'application/vnd.api+json',
            ...studentApiKeyHeader(basicAuthToken),
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching exams for class:', error);
      const backendMessage = backendErrorMessage(error);
      throw new Error(`Failed to fetch exams: ${backendMessage}`);
    }
  }

  // Get all students by organization ID
  static async getStudents(orgId: string): Promise<StudentListResponse> {
    const cacheKey = `students_${orgId}`;

    // Check cache first (30 sec TTL for students)
    const cached = apiCache.get<StudentListResponse>(cacheKey);
    if (cached) {
      console.log('✅ Using cached students data');
      return cached;
    }

    // Deduplicate concurrent requests
    return apiCache.dedupe(cacheKey, async () => {
      return retryRequest(async () => {
        try {
          // Get authentication token
          const tokenStr = localStorage.getItem('bearerToken');
          if (!tokenStr) {
            throw new Error('No authentication token found');
          }

          const tokenItem = JSON.parse(tokenStr);
          const now = new Date().getTime();

          if (now > tokenItem.expiry) {
            localStorage.removeItem('bearerToken');
            throw new Error('Authentication token has expired');
          }

          const response = await externalApi.get(`/${orgId}/students`, {
            headers: {
              Authorization: `Bearer ${tokenItem.value}`,
            },
          });
          // Cache the result
          apiCache.set(cacheKey, response.data, 30000);
          return response.data;
        } catch (error) {
          console.error('Error fetching students:', error);
          throw error; // Let retryRequest handle the retry
        }
      });
    });
  }

  // Bulk-create students (CSV import). Backend isolates per-row failures -
  // a bad row doesn't abort the whole batch - and returns a succeeded/
  // failed summary the caller can show the admin directly.
  static async bulkCreateStudents(
    orgId: string,
    students: Array<Record<string, unknown>>,
  ): Promise<BulkImportResponse> {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      throw new Error('No authentication token found');
    }

    const tokenItem = JSON.parse(tokenStr);
    const now = new Date().getTime();

    if (now > tokenItem.expiry) {
      localStorage.removeItem('bearerToken');
      throw new Error('Authentication token has expired');
    }

    const response = await externalApi.post(
      `/${orgId}/students/bulk`,
      {
        data: students.map((attributes) => ({
          type: 'students',
          attributes,
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      },
    );
    this.clearCache('students', orgId);
    return response.data;
  }

  // Bulk-create faculty (CSV import). Same isolated-per-row-failure
  // contract as bulkCreateStudents.
  static async bulkCreateFaculty(
    orgId: string,
    faculty: Array<Record<string, unknown>>,
  ): Promise<BulkImportResponse> {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      throw new Error('No authentication token found');
    }

    const tokenItem = JSON.parse(tokenStr);
    const now = new Date().getTime();

    if (now > tokenItem.expiry) {
      localStorage.removeItem('bearerToken');
      throw new Error('Authentication token has expired');
    }

    const response = await externalApi.post(
      `/${orgId}/faculty/bulk`,
      {
        data: faculty.map((attributes) => ({
          type: 'faculty',
          attributes,
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
          'Content-Type': 'application/vnd.api+json',
        },
      },
    );
    return response.data;
  }

  // Role management - promoting an existing faculty member to an
  // org-admin role ("head"/"superwise") is the actual working path to a
  // second admin account: it reuses the faculty member's existing,
  // already-Auth0-backed login rather than the separate "create admin
  // user" backend flow, which writes to a table the login authorizer
  // never checks and so can never actually sign in.
  private static authHeaders() {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      throw new Error('No authentication token found');
    }
    const tokenItem = JSON.parse(tokenStr);
    const now = new Date().getTime();
    if (now > tokenItem.expiry) {
      localStorage.removeItem('bearerToken');
      throw new Error('Authentication token has expired');
    }
    return { Authorization: `Bearer ${tokenItem.value}` };
  }

  static async getUsersByRole(
    orgId: string,
    role: string,
  ): Promise<ApiCollection<UserRoleAttributes>> {
    const response = await externalApi.get(`/${orgId}/users/by-role/${role}`, {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  static async assignUserRole(
    orgId: string,
    userId: string,
    role: string,
  ): Promise<ApiDocument<UserRoleAttributes>> {
    const response = await externalApi.put(
      `/${orgId}/roles/users/${userId}`,
      { data: { type: 'roles', attributes: { role } } },
      { headers: this.authHeaders() },
    );
    return response.data;
  }

  static async removeUserRole(
    orgId: string,
    userId: string,
  ): Promise<ApiDocument<UserRoleAttributes>> {
    const response = await externalApi.delete(
      `/${orgId}/roles/users/${userId}`,
      { headers: this.authHeaders() },
    );
    return response.data;
  }

  // Students not currently enrolled in any class - used by the admin
  // "Add Student to Class" flow. Not cached like getStudents() since it's
  // only fetched on-demand when that modal opens.
  static async getUnassignedStudents(
    orgId: string,
  ): Promise<ApiCollection<ClassStudentAttributes>> {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      throw new Error('No authentication token found');
    }

    const tokenItem = JSON.parse(tokenStr);
    const now = new Date().getTime();

    if (now > tokenItem.expiry) {
      localStorage.removeItem('bearerToken');
      throw new Error('Authentication token has expired');
    }

    const response = await externalApi.get(
      `/${orgId}/students?unassigned=true`,
      {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      },
    );
    return response.data;
  }

  // Create new student
  static async createStudent(
    orgId: string,
    studentData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dob: string;
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
    },
  ): Promise<StudentResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      // Format date to DD/MM/YYYY
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const requestBody = {
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

      console.log(`Making POST request to: /${orgId}/students`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.post(
        `/${orgId}/students`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      // Invalidate students cache
      this.clearCache('students', orgId);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error('Failed to create student');
    }
  }

  // Update existing student
  static async updateStudent(
    orgId: string,
    studentId: string,
    studentData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dob: string;
      gender: string;
      uniqueId: string;
      profile: string;
      gradeLevel: string;
      isMonitor: boolean;
      classId: string;
      guardianInfo: {
        fatherName: string;
        motherName: string;
        phone: string;
        email: string;
        address: string;
      };
    }>,
  ): Promise<StudentResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      // Format date to DD/MM/YYYY if provided
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Build request body with only provided fields
      const attributes: Record<string, unknown> = {};

      if (studentData.firstName) attributes.first_name = studentData.firstName;
      if (studentData.lastName) attributes.last_name = studentData.lastName;
      if (studentData.email) attributes.email = studentData.email;
      if (studentData.phone) attributes.phone = studentData.phone;
      if (studentData.dob)
        attributes.date_of_birth = formatDate(studentData.dob);
      if (studentData.gender) attributes.gender = studentData.gender;
      if (studentData.uniqueId) attributes.unique_id = studentData.uniqueId;
      if (studentData.profile) attributes.profile = studentData.profile;
      if (studentData.gradeLevel)
        attributes.grade_level = studentData.gradeLevel;

      if (studentData.guardianInfo) {
        attributes.guardian_info = {
          father_name: studentData.guardianInfo.fatherName,
          mother_name: studentData.guardianInfo.motherName,
          phone: studentData.guardianInfo.phone,
          email: studentData.guardianInfo.email,
          address: studentData.guardianInfo.address,
        };
      }

      const requestBody = {
        data: {
          type: 'students',
          id: studentId,
          attributes,
        },
      };

      console.log(`Making PUT request to: /${orgId}/students/${studentId}`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await externalApi.put(
        `/${orgId}/students/${studentId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('API response:', response.data);
      // Invalidate students cache
      this.clearCache('students', orgId);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student');
    }
  }

  // Get attendance for a class
  static async getClassAttendance(
    orgId: string,
    classId: string,
  ): Promise<ClassAttendanceResponse> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/attendance/class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      return response.data;
    } catch (error) {
      // A 404 genuinely means "no attendance recorded for this class yet" -
      // a normal, common state, not a failure. Any other status is a real
      // fetch error and should be treated differently by the caller (not
      // silently defaulted to "everyone present", which risks overwriting
      // real data on save).
      if (errorStatus(error) === 404) {
        return { data: null };
      }
      console.error('Error fetching class attendance:', error);
      throw new Error('Failed to fetch class attendance');
    }
  }

  // Get student attendance for a specific month
  static async getStudentMonthlyAttendance(
    orgId: string,
    studentId: string,
    month: string, // Format: MM-YYYY
  ): Promise<MonthlyAttendanceResponse> {
    try {
      // Get student authentication token
      const studentAuthStr = localStorage.getItem('studentAuth');
      if (!studentAuthStr) {
        throw new Error('No student authentication found');
      }

      const studentAuth = JSON.parse(studentAuthStr);
      const basicAuthToken = studentAuth.basicAuthToken;

      if (!basicAuthToken) {
        throw new Error('No authentication token found');
      }

      const response = await classApi.get(
        `/${orgId}/attendance/student/${studentId}/${month}`,
        {
          headers: {
            ...studentApiKeyHeader(basicAuthToken),
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching student monthly attendance:', error);
      throw new Error('Failed to fetch student monthly attendance');
    }
  }

  // Same endpoint as getStudentMonthlyAttendance, but authenticated with a
  // staff bearer token instead of a student's x-api-key - for teachers/
  // admins looking up a student's monthly attendance from the class roster.
  static async getStudentMonthlyAttendanceAsStaff(
    orgId: string,
    studentId: string,
    month: string, // Format: MM-YYYY
  ): Promise<MonthlyAttendanceResponse> {
    try {
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const response = await classApi.get(
        `/${orgId}/attendance/student/${studentId}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching student monthly attendance:', error);
      throw new Error('Failed to fetch student monthly attendance');
    }
  }

  // Update/Submit attendance for a class
  static async submitClassAttendance(
    orgId: string,
    classId: string,
    attendanceData: Array<{
      class_id: string;
      student_id: string;
      status: string;
      date: string;
      student_roll_no: string;
    }>,
  ): Promise<ApiDocument<AttendanceDay | AttendanceDay[]>> {
    try {
      // Get authentication token
      const tokenStr = localStorage.getItem('bearerToken');
      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();

      if (now > tokenItem.expiry) {
        localStorage.removeItem('bearerToken');
        throw new Error('Authentication token has expired');
      }

      const requestBody = {
        data: {
          type: 'attaindace',
          attributes: attendanceData,
        },
      };

      console.log(
        `Making POST request to: /${orgId}/attendance/class/${classId}`,
      );
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await classApi.post(
        `/${orgId}/attendance/class/${classId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${tokenItem.value}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      console.log('Attendance submitted successfully');
      return response.data;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw new Error('Failed to submit attendance');
    }
  }

  // Combined function to fetch all data in sequence
  static async fetchAllData(
    subdomainParam?: string,
  ): Promise<FetchAllDataResult> {
    // Determine subdomain from parameter, URL, or default
    let targetSubdomain = subdomainParam;

    if (!targetSubdomain && typeof window !== 'undefined') {
      // Try to extract subdomain from current URL
      const hostname = window.location.hostname;
      if (hostname.includes('.')) {
        targetSubdomain = hostname.split('.')[0];
      }
    }

    // Default to 'auth' if no subdomain found
    targetSubdomain = targetSubdomain || 'auth';

    const cacheKey = `fetchAllData_${targetSubdomain}`;
    const cached = apiCache.get<FetchAllDataResult>(cacheKey);
    if (cached) return cached;

    return apiCache.dedupe(cacheKey, async () => {
      try {
        console.log('Fetching data for subdomain:', targetSubdomain);

        // Step 1: Get subdomain data first
        const subdomainData = await this.getSubdomain(targetSubdomain!);
        const orgId = subdomainData.config.organizationId;

        // Step 2: Get remaining data in parallel (they can run concurrently)
        const [
          contentData,
          productsData,
          userInfoData,
          heroData,
          aboutData,
          siteConfigData,
          brandingData,
          programsData,
          statsData,
          newsData,
        ] = await Promise.allSettled([
          this.getContent(),
          this.getProducts(),
          this.getUserInfo(subdomainData.subdomain),
          orgId ? this.getHero(orgId) : Promise.reject('No org ID'),
          orgId ? this.getAbout(orgId) : Promise.reject('No org ID'),
          orgId ? this.getSiteConfig(orgId) : Promise.reject('No org ID'),
          orgId ? this.getBranding(orgId) : Promise.reject('No org ID'),
          orgId ? this.getPrograms(orgId) : Promise.reject('No org ID'),
          orgId ? this.getStats(orgId) : Promise.reject('No org ID'),
          orgId ? this.getNews(orgId) : Promise.reject('No org ID'),
        ]);

        const result: FetchAllDataResult = {
          subdomain: subdomainData,
          content:
            contentData.status === 'fulfilled'
              ? contentData.value
              : ({} as ContentResponse),
          products:
            productsData.status === 'fulfilled' ? productsData.value : [],
          userInfo:
            userInfoData.status === 'fulfilled'
              ? userInfoData.value
              : { users: 0, active: false },
          hero: heroData.status === 'fulfilled' ? heroData.value : undefined,
          about: aboutData.status === 'fulfilled' ? aboutData.value : undefined,
          siteConfig:
            siteConfigData.status === 'fulfilled'
              ? siteConfigData.value
              : undefined,
          branding:
            brandingData.status === 'fulfilled'
              ? brandingData.value
              : undefined,
          programs:
            programsData.status === 'fulfilled'
              ? programsData.value
              : undefined,
          stats: statsData.status === 'fulfilled' ? statsData.value : undefined,
          news: newsData.status === 'fulfilled' ? newsData.value : undefined,
        };

        apiCache.set(cacheKey, result, 300000);
        return result;
      } catch (error) {
        console.error('Error fetching all API data:', error);
        throw new Error('Failed to fetch required data');
      }
    });
  }
}

// Helper function to transform API data to OrganizationConfig
export const transformApiDataToOrganizationConfig = (apiData: {
  subdomain: SubdomainResponse;
  content: ContentResponse;
  products: Product[];
  userInfo: UserInfoResponse;
  hero?: HeroResponse;
  about?: AboutResponse;
  siteConfig?: SiteConfigResponse;
  branding?: BrandingResponse;
  programs?: ProgramsResponse;
  stats?: StatsResponse;
  news?: NewsResponse;
}) => {
  const {
    subdomain,
    content,
    products,
    userInfo,
    hero,
    about,
    siteConfig,
    branding,
    programs,
    stats,
    news,
  } = apiData;
  // Transform the API data into OrganizationConfig format
  return {
    orgId: subdomain?.config?.organizationId,
    subdomain: subdomain?.subdomain,
    name: subdomain?.config?.name || 'Educational Institution',
    type: 'school' as const,
    tagline: hero?.data.attributes.headline || 'Excellence in Education',
    description:
      hero?.data.attributes.subheadline || 'A premier educational institution.',
    founded: subdomain?.config?.founded || new Date().getFullYear() - 10,

    contact: {
      email: subdomain.config.contact?.email || 'info@school.edu',
      phone: subdomain.config.contact?.phone || '+91-000-000-0000',
      address: {
        street: subdomain.config.contact?.address || 'Organization Address',
        city: 'City',
        state: 'State',
        country: 'India',
        zipCode: '000000',
      },
    },

    branding: {
      logo: convertGoogleDriveUrl(
        subdomain.config.logo || branding?.data.attributes.logo || '',
      ),
      favicon: branding?.data.attributes.favicon || '/favicon.ico',
      primaryColor: subdomain.config.primaryColor || '#059669',
      secondaryColor: subdomain.config.secondaryColor || '#10B981',
      accentColor: subdomain.config.accentColor || '#F59E0B',
      fontFamily: subdomain.config.fontFamily || 'Arial',
    },

    hero: {
      title:
        hero?.data.attributes.headline ||
        content.title ||
        'Welcome to Our Institution',
      subtitle: hero?.data.attributes.subheadline || 'Excellence in Education',
      description: hero?.data.attributes.description || '',
      backgroundImage:
        hero?.data.attributes.image ||
        branding?.data.attributes.banner ||
        content.banner ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9d1',
      ctaButtons: {
        primary: {
          text: hero?.data.attributes.ctaText || 'Learn More',
          link: hero?.data.attributes.ctaLink || '/about',
        },
        secondary: { text: 'Coming Soon', link: '/admissions' },
      },
    },

    about: {
      title: about?.data.attributes.title || 'About Us',
      content:
        about?.data.attributes.content ||
        'We are committed to excellence in education.',
      mission:
        about?.data.attributes.mission || 'To provide quality education.',
      vision:
        about?.data.attributes.vision ||
        'To be a leading educational institution.',
      values: about?.data.attributes.values || [
        'Academic excellence',
        'Character building',
        'Innovation in learning',
      ],
      images: about?.data.attributes.images || [
        '/images/about-1.jpg',
        '/images/about-2.jpg',
        '/images/about-3.jpg',
      ],
    },

    programs: {
      title: 'Our Programs',
      items:
        programs?.data.map((program) => ({
          name: program.attributes.title,
          description: program.attributes.description,
          image: program.attributes.image || '/images/program.jpg',
          link: `/programs/${program.id}`,
          features: [
            `Duration: ${program.attributes.duration}`,
            `Eligibility: ${program.attributes.eligibility}`,
            'Quality Education',
            'Expert Faculty',
          ],
        })) ||
        products.map((product) => ({
          name: product.name,
          description: product.description || 'Educational program',
          image: product.image || '/images/program.jpg',
          link: `/programs/${product.id}`,
          features: [
            'Quality Education',
            'Expert Faculty',
            'Modern Facilities',
            'Holistic Development',
          ],
        })),
    },

    stats: {
      title: 'Our Achievements',
      items: stats?.data.map((stat) => ({
        id: stat.id,
        label: stat.attributes.label,
        value: stat.attributes.value,
        icon: stat.attributes.icon,
      })) || [
        { label: 'Active Users', value: `${userInfo.users}+`, icon: '👥' },
        {
          label: 'Programs/Services',
          value: `${programs?.data.length || products.length}+`,
          icon: '📚',
        },
        { label: 'Years of Service', value: '10+', icon: '🏆' },
        {
          label: 'Success Rate',
          value: userInfo.active ? '100%' : '95%',
          icon: '✅',
        },
      ],
    },

    faculty: {
      title: 'Meet Our Team',
      featured: [
        {
          name: 'Principal',
          position: 'Head of Institution',
          image: '/images/principal.jpg',
          bio: 'Leading our institution with dedication and vision.',
          qualifications: ['Educational Leadership', 'Academic Excellence'],
        },
      ],
    },

    news: {
      title: 'Latest Updates',
      items:
        news?.data
          .map((newsItem) => ({
            title: newsItem.attributes.title,
            excerpt: newsItem.attributes.content,
            date: new Date(newsItem.attributes.publishedAt * 1000)
              .toISOString()
              .split('T')[0],
            image: newsItem.attributes.image || '/images/news.jpg',
            link: `/news/${newsItem.id}`,
          }))
          .slice(0, 5) || [],
    },

    social: {
      facebook: about?.data.attributes.social.facebook || '',
      twitter: about?.data.attributes.social.twitter || '',
      instagram: about?.data.attributes.social.instagram || '',
      linkedin: about?.data.attributes.social.linkedin || '',
      youtube: about?.data.attributes.social.youtube || '',
    },

    siteConfig: {
      domain:
        siteConfig?.data.attributes.customDomain ||
        `${subdomain.subdomain}.example.com`,
      title:
        siteConfig?.data.attributes.seo.title ||
        `${content.title} - Excellence in Education`,
      metaDescription:
        siteConfig?.data.attributes.seo.description ||
        'Premier educational institution',
      keywords: siteConfig?.data.attributes.seo.keywords || [
        'education',
        'school',
        'learning',
        subdomain.subdomain,
      ],
      language: subdomain.config.language || 'en',
      timezone: 'Asia/Kolkata',
      affiliatedCode:
        content.sections?.find((s) => s.type === 'affiliation')?.data?.code ||
        'EDU123',
    },
  };
};

// Default export for backward compatibility
export default ApiService;
