import axios from 'axios';

// Configuration for API endpoints
const API_CONFIG = {
  // Use external API for real endpoints
  EXTERNAL_API:
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth',
  // Use local API for mock endpoints (during development)
  LOCAL_API:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
  // Flag to use external API for content endpoints (set to false to use local mock)
  USE_EXTERNAL_FOR_CONTENT:
    process.env.NEXT_PUBLIC_USE_EXTERNAL_CONTENT === 'true',
};

// External API instance (for real endpoints like users/me)
const externalApi = axios.create({
  baseURL: API_CONFIG.EXTERNAL_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Local API instance (for mock content endpoints)
const localApi = axios.create({
  baseURL: API_CONFIG.LOCAL_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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
      code: string;
      logo: string;
      contact: {
        address: string;
        phone: string;
        email: string;
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

// API service functions
export class ApiService {
  // Step 1: Get subdomain and base configuration (keeping for backward compatibility)
  static async getSubdomain(
    subdomain: string = 'sls',
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

      // Fallback to local mock API
      console.log('Falling back to local mock API for subdomain data');
      try {
        const fallbackResponse = await localApi.get('/api/subdomain');
        console.log('Local API fallback successful:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        throw new Error(
          'Failed to fetch subdomain configuration from both external and local APIs',
        );
      }
    }
  }

  // Step 2: Get landing page content
  static async getContent(): Promise<ContentResponse> {
    try {
      const api = API_CONFIG.USE_EXTERNAL_FOR_CONTENT ? externalApi : localApi;
      const endpoint = API_CONFIG.USE_EXTERNAL_FOR_CONTENT
        ? '/content'
        : '/api/content';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching content data:', error);
      throw new Error('Failed to fetch content data');
    }
  }

  // Step 3: Get products/services
  static async getProducts(): Promise<Product[]> {
    try {
      const api = API_CONFIG.USE_EXTERNAL_FOR_CONTENT ? externalApi : localApi;
      const endpoint = API_CONFIG.USE_EXTERNAL_FOR_CONTENT
        ? '/products'
        : '/api/products';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching products data:', error);
      throw new Error('Failed to fetch products data');
    }
  }

  // Step 4: Get user info with subdomain
  static async getUserInfo(subdomain: string): Promise<UserInfoResponse> {
    try {
      const api = API_CONFIG.USE_EXTERNAL_FOR_CONTENT ? externalApi : localApi;
      const endpoint = API_CONFIG.USE_EXTERNAL_FOR_CONTENT
        ? '/user-info'
        : '/api/user-info';
      const response = await api.post(endpoint, { subdomain });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Failed to fetch user information');
    }
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

  // Combined function to fetch all data in sequence
  static async fetchAllData(subdomainParam?: string): Promise<{
    subdomain: SubdomainResponse;
    content: ContentResponse;
    products: Product[];
    userInfo: UserInfoResponse;
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

      // Default to 'sls' if no subdomain found
      targetSubdomain = targetSubdomain || 'sls';

      console.log('Fetching data for subdomain:', targetSubdomain);

      // Step 1: Get subdomain data first
      const subdomainData = await this.getSubdomain(targetSubdomain);

      // Step 2-4: Get remaining data in parallel (they can run concurrently)
      const [contentData, productsData, userInfoData] = await Promise.all([
        this.getContent(),
        this.getProducts(),
        this.getUserInfo(subdomainData.subdomain),
      ]);

      return {
        subdomain: subdomainData,
        content: contentData,
        products: productsData,
        userInfo: userInfoData,
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
}) => {
  const { subdomain, content, products, userInfo } = apiData;

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
      email:
        content.sections.find((s) => s.type === 'contact')?.data?.email ||
        'info@school.edu',
      phone:
        content.sections.find((s) => s.type === 'contact')?.data?.phone ||
        '+91-000-000-0000',
      address: {
        street:
          content.sections.find((s) => s.type === 'contact')?.data?.address
            ?.street || 'School Street',
        city:
          content.sections.find((s) => s.type === 'contact')?.data?.address
            ?.city || 'City',
        state:
          content.sections.find((s) => s.type === 'contact')?.data?.address
            ?.state || 'State',
        country:
          content.sections.find((s) => s.type === 'contact')?.data?.address
            ?.country || 'India',
        zipCode:
          content.sections.find((s) => s.type === 'contact')?.data?.address
            ?.zipCode || '000000',
      },
    },

    branding: {
      logo:
        content.sections.find((s) => s.type === 'branding')?.data?.logo ||
        '/images/logo.png',
      favicon: '/favicon.ico',
      primaryColor: subdomain.config.primaryColor || '#059669',
      secondaryColor: subdomain.config.secondaryColor || '#10B981',
      accentColor: subdomain.config.accentColor || '#F59E0B',
    },

    hero: {
      title:
        content.sections.find((s) => s.type === 'hero')?.title || content.title,
      subtitle:
        content.sections.find((s) => s.type === 'hero')?.content ||
        'Welcome to our institution',
      backgroundImage:
        content.banner ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9d1',
      ctaButtons: {
        primary: { text: 'Apply for Admissions', link: '/admissions' },
        secondary: { text: 'Virtual Tour', link: '/tour' },
      },
    },

    about: {
      title:
        content.sections.find((s) => s.type === 'about')?.title || 'About Us',
      content:
        content.sections.find((s) => s.type === 'about')?.content ||
        'We are committed to excellence in education.',
      mission:
        content.sections.find((s) => s.type === 'mission')?.content ||
        'To provide quality education.',
      vision:
        content.sections.find((s) => s.type === 'vision')?.content ||
        'To be a leading educational institution.',
      values: content.sections.find((s) => s.type === 'values')?.data
        ?.values || [
        'Academic excellence',
        'Character building',
        'Innovation in learning',
      ],
      images: [
        content.sections.find((s) => s.type === 'about')?.image ||
          '/images/about-1.jpg',
        '/images/about-2.jpg',
        '/images/about-3.jpg',
      ],
    },

    programs: {
      title: 'Our Programs',
      items: products.map((product) => ({
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
      items: [
        { label: 'Active Users', value: `${userInfo.users}+`, icon: '👥' },
        {
          label: 'Products/Services',
          value: `${products.length}+`,
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
      items: content.sections
        .filter((s) => s.type === 'news')
        .map((news) => ({
          title: news.title,
          excerpt: news.content,
          date: new Date().toISOString().split('T')[0],
          image: news.image || '/images/news.jpg',
          link: `/news/${news.id}`,
        }))
        .slice(0, 3),
    },

    social: {
      facebook:
        content.sections.find((s) => s.type === 'social')?.data?.facebook || '',
      twitter:
        content.sections.find((s) => s.type === 'social')?.data?.twitter || '',
      instagram:
        content.sections.find((s) => s.type === 'social')?.data?.instagram ||
        '',
      linkedin:
        content.sections.find((s) => s.type === 'social')?.data?.linkedin || '',
      youtube:
        content.sections.find((s) => s.type === 'social')?.data?.youtube || '',
    },

    siteConfig: {
      domain: `${subdomain.subdomain}.example.com`,
      title: `${content.title} - Excellence in Education`,
      metaDescription:
        content.sections.find((s) => s.type === 'description')?.content ||
        'Premier educational institution',
      keywords: ['education', 'school', 'learning', subdomain.subdomain],
      language: subdomain.config.language || 'en',
      timezone: 'Asia/Kolkata',
      affiliatedCode:
        content.sections.find((s) => s.type === 'affiliation')?.data?.code ||
        'EDU123',
    },
  };
};
