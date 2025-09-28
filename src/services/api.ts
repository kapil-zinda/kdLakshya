import axios from 'axios';

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
  // Use local API for mock endpoints (during development)
  LOCAL_API:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
};

// External API instance (for real endpoints like users/me)
const externalApi = axios.create({
  baseURL: API_CONFIG.EXTERNAL_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Class API instance (for class endpoints)
const classApi = axios.create({
  baseURL: API_CONFIG.CLASS_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/vnd.api+json',
  },
});

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
    [key: string]: any;
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
    data?: any;
  }>;
  [key: string]: any;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  [key: string]: any;
}

export interface UserInfoResponse {
  users: number;
  active: boolean;
  [key: string]: any;
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
      room: string;
      academic_year: string;
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

// API service functions
export class ApiService {
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
  static async getUserInfo(subdomain: string): Promise<UserInfoResponse> {
    // User info API has been removed - return default values
    return { users: 0, active: false };
  }

  // Get organization data by subdomain
  static async getOrganization(
    subdomain: string,
  ): Promise<OrganizationResponse> {
    try {
      const response = await externalApi.get(
        `/organizations/subdomain/${subdomain}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching organization data:', error);
      throw new Error('Failed to fetch organization data');
    }
  }

  // Get organization data by ID
  static async getOrganizationById(
    orgId: string,
    accessToken?: string,
  ): Promise<OrganizationResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
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
    organizationData: {
      name?: string;
      subdomain?: string;
      description?: string;
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
    },
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
      // Priority 1: Check if user is logged in and get org ID from user data
      if (typeof window !== 'undefined') {
        const cachedUserData = localStorage.getItem('cachedUserData');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
            if (userData.orgId) {
              return userData.orgId;
            }
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }
      }

      // Priority 2: Check if we already have the org ID cached in sessionStorage
      if (typeof window !== 'undefined') {
        const cachedOrgId = sessionStorage.getItem('currentOrgId');
        if (cachedOrgId) {
          return cachedOrgId;
        }
      }

      // Priority 3: If we have a bearer token, fetch user data to get org ID
      if (typeof window !== 'undefined') {
        const tokenStr = localStorage.getItem('bearerToken');
        if (tokenStr) {
          try {
            const tokenItem = JSON.parse(tokenStr);
            const now = new Date().getTime();

            if (now < tokenItem.expiry && tokenItem.value) {
              const userResponse = await this.getUserMe(tokenItem.value);
              const userData = userResponse.data;
              const orgId =
                userData.attributes.org_id || userData.attributes.org;

              if (orgId) {
                // Cache the org ID for future use
                sessionStorage.setItem('currentOrgId', orgId);
                return orgId;
              }
            }
          } catch (error) {
            console.error('Error fetching user data to get org ID:', error);
            // Continue to fallback method
          }
        }
      }

      // Priority 4 (Fallback): Get subdomain from current URL
      let subdomain = '';

      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // Handle localhost development - default to 'auth' for testing
        if (
          hostname === 'localhost' ||
          hostname.startsWith('localhost:') ||
          hostname === '127.0.0.1'
        ) {
          subdomain = 'auth'; // Default subdomain for localhost development
        } else {
          // Extract subdomain from production URL (e.g., 'auth' from 'auth.uchhal.in')
          const parts = hostname.split('.');
          if (parts.length > 2) {
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
    try {
      const response = await externalApi.get(`/${orgId}/siteconfig`);
      return response.data;
    } catch (error) {
      console.error('Error fetching site config:', error);
      throw new Error('Failed to fetch site configuration');
    }
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
    try {
      const response = await externalApi.get(`/${orgId}/about`);
      return response.data;
    } catch (error) {
      console.error('Error fetching about data:', error);
      throw new Error('Failed to fetch about section data');
    }
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
    try {
      const response = await externalApi.get(`/${orgId}/hero`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hero data:', error);
      throw new Error('Failed to fetch hero section data');
    }
  }

  // Update hero section data by organization ID
  static async updateHero(
    orgId: string,
    heroData: {
      headline: string;
      subheadline: string;
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
    try {
      const response = await externalApi.get(`/${orgId}/branding`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branding data:', error);
      throw new Error('Failed to fetch branding data');
    }
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
      title: string;
      content: string;
      image: string;
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

  // Get all faculty members by organization ID
  static async getFaculty(orgId: string): Promise<FacultyListResponse> {
    try {
      const response = await externalApi.get(`/${orgId}/faculty`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      throw new Error('Failed to fetch faculty data');
    }
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
      return response.data;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw new Error('Failed to create faculty member');
    }
  }

  // Get programs data by organization ID
  static async getPrograms(orgId: string): Promise<ProgramsResponse> {
    try {
      const response = await externalApi.get(`/${orgId}/programs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching programs data:', error);
      throw new Error('Failed to fetch programs data');
    }
  }

  // Get stats data by organization ID
  static async getStats(orgId: string): Promise<StatsResponse> {
    try {
      const response = await externalApi.get(`/${orgId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats data:', error);
      throw new Error('Failed to fetch stats data');
    }
  }

  // Get news/notifications data by organization ID
  static async getNews(orgId: string): Promise<NewsListResponse> {
    try {
      const response = await externalApi.get(`/${orgId}/news`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news data:', error);
      throw new Error('Failed to fetch news/notifications data');
    }
  }

  // Additional method to get user data (using the real API structure)
  static async getUserMe(token: string): Promise<RealUserResponse> {
    try {
      const response = await externalApi.get('/users/me?include=permission', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  // Get all classes by organization ID
  static async getClasses(orgId: string): Promise<ClassListResponse> {
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

      const response = await classApi.get(`/${orgId}/classes`, {
        headers: {
          Authorization: `Bearer ${tokenItem.value}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }
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
    } catch (error) {
      console.error('Error deleting class:', error);
      throw new Error('Failed to delete class');
    }
  }

  // Get students enrolled in a specific class
  static async getClassStudents(orgId: string, classId: string): Promise<any> {
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

  // Enroll a student in a class
  static async enrollStudentInClass(
    orgId: string,
    classId: string,
    enrollmentData: {
      student_id: string;
      roll_number: string;
      academic_year: string;
    },
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
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
  ): Promise<any> {
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
        max_marks: number;
      }>;
    },
  ): Promise<any> {
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
      throw new Error('Failed to create exam');
    }
  }

  // Get all students by organization ID
  static async getStudents(orgId: string): Promise<StudentListResponse> {
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
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to fetch students');
    }
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
      const attributes: any = {};

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
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student');
    }
  }

  // Combined function to fetch all data in sequence
  static async fetchAllData(subdomainParam?: string): Promise<{
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
  }> {
    try {
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

      console.log('Fetching data for subdomain:', targetSubdomain);

      // Step 1: Get subdomain data first
      const subdomainData = await this.getSubdomain(targetSubdomain);
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

      return {
        subdomain: subdomainData,
        content:
          contentData.status === 'fulfilled'
            ? contentData.value
            : ({} as ContentResponse),
        products: productsData.status === 'fulfilled' ? productsData.value : [],
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
          brandingData.status === 'fulfilled' ? brandingData.value : undefined,
        programs:
          programsData.status === 'fulfilled' ? programsData.value : undefined,
        stats: statsData.status === 'fulfilled' ? statsData.value : undefined,
        news: newsData.status === 'fulfilled' ? newsData.value : undefined,
      };
    } catch (error) {
      console.error('Error fetching all API data:', error);
      throw new Error('Failed to fetch required data');
    }
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
    name: content.title || 'Educational Institution',
    type: 'school' as const,
    tagline:
      content.sections.find((s) => s.type === 'tagline')?.content ||
      'Excellence in Education',
    description:
      content.sections.find((s) => s.type === 'description')?.content ||
      'A premier educational institution.',
    founded: new Date().getFullYear() - 10, // Default to 10 years ago

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
      logo: branding?.data.attributes.logo || '/images/logo.png',
      favicon: branding?.data.attributes.favicon || '/favicon.ico',
      primaryColor: subdomain.config.primaryColor || '#059669',
      secondaryColor: subdomain.config.secondaryColor || '#10B981',
      accentColor: subdomain.config.accentColor || '#F59E0B',
    },

    hero: {
      title:
        hero?.data.attributes.headline ||
        content.title ||
        'Welcome to Our Institution',
      subtitle: hero?.data.attributes.subheadline || 'Excellence in Education',
      backgroundImage:
        hero?.data.attributes.image ||
        branding?.data.attributes.banner ||
        content.banner ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9d1',
      ctaButtons: {
        primary: {
          text: hero?.data.attributes.ctaText || 'Apply for Admissions',
          link: hero?.data.attributes.ctaLink || '/admissions',
        },
        secondary: { text: 'Virtual Tour', link: '/tour' },
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
