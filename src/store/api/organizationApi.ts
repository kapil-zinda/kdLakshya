/**
 * RTK Query API for Organization & Settings Management
 * Migrated from src/services/api.ts
 * Handles organization config, site settings, content management
 */

import { baseApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Site Config
export interface SiteConfig {
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
}

export interface SiteConfigResponse {
  data: {
    type: 'siteconfig';
    id: string;
    attributes: SiteConfig;
    links: {
      self: string;
    };
  };
}

export interface UpdateSiteConfigRequest {
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
}

// About Section
export interface About {
  id: string;
  orgId: string;
  title: string;
  content: string;
  mission: string;
  vision: string;
  values: string[];
  images: string[];
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
}

export interface AboutResponse {
  data: {
    type: 'about';
    id: string;
    attributes: About;
    links: {
      self: string;
    };
  };
}

export interface UpdateAboutRequest {
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
}

// Hero Section
export interface Hero {
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
}

export interface HeroResponse {
  data: {
    type: 'hero';
    id: string;
    attributes: Hero;
    links: {
      self: string;
    };
  };
}

export interface UpdateHeroRequest {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

// Branding
export interface Branding {
  id: string;
  orgId: string;
  logo: string;
  favicon?: string;
  banner?: string;
  watermark?: string;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
}

export interface BrandingResponse {
  data: {
    type: 'branding';
    id: string;
    attributes: Branding;
    links: {
      self: string;
    };
  };
}

export interface UpdateBrandingRequest {
  logo: string;
  favicon?: string;
  banner?: string;
  watermark?: string;
}

// News/Notifications
export interface News {
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
}

export interface NewsResponse {
  data: {
    type: 'news';
    id: string;
    attributes: News;
    links: {
      self: string;
    };
  };
}

export interface NewsListResponse {
  data: {
    type: 'news';
    id: string;
    attributes: News;
    links: {
      self: string;
    };
  }[];
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  image: string;
  publishedAt?: number;
}

export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  image?: string;
  publishedAt?: number;
}

// Stats
export interface Stat {
  id: string;
  orgId: string;
  label: string;
  value: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
  created_by: string;
  created_by_email: string;
}

export interface StatsResponse {
  data: {
    type: 'stats';
    id: string;
    attributes: Stat;
    links: {
      self: string;
    };
  }[];
}

export interface CreateStatRequest {
  label: string;
  value: string;
  icon: string;
}

export interface UpdateStatRequest {
  label?: string;
  value?: string;
  icon?: string;
}

// Programs
export interface Program {
  id: string;
  orgId: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProgramsResponse {
  data: {
    type: 'programs';
    id: string;
    attributes: Program;
    links: {
      self: string;
    };
  }[];
}

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const organizationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // SITE CONFIG
    // ========================================================================

    /**
     * Get site configuration
     */
    getSiteConfig: builder.query<SiteConfigResponse, string>({
      query: (orgId) => `/${orgId}/siteconfig`,
      providesTags: (result, error, orgId) => [
        { type: 'SiteConfig', id: orgId },
      ],
    }),

    /**
     * Update site configuration
     */
    updateSiteConfig: builder.mutation<
      SiteConfigResponse,
      { orgId: string; siteConfigData: UpdateSiteConfigRequest }
    >({
      query: ({ orgId, siteConfigData }) => ({
        url: `/${orgId}/siteconfig`,
        method: 'PUT',
        body: {
          data: {
            type: 'siteconfigs',
            attributes: siteConfigData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'SiteConfig', id: orgId },
      ],
    }),

    // ========================================================================
    // ABOUT SECTION
    // ========================================================================

    /**
     * Get about section
     */
    getAbout: builder.query<AboutResponse, string>({
      query: (orgId) => `/${orgId}/about`,
      providesTags: (result, error, orgId) => [
        { type: 'Content', id: `about-${orgId}` },
      ],
    }),

    /**
     * Update about section
     */
    updateAbout: builder.mutation<
      AboutResponse,
      { orgId: string; aboutData: UpdateAboutRequest }
    >({
      query: ({ orgId, aboutData }) => ({
        url: `/${orgId}/about`,
        method: 'PUT',
        body: {
          data: {
            type: 'about',
            attributes: aboutData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `about-${orgId}` },
      ],
    }),

    // ========================================================================
    // HERO SECTION
    // ========================================================================

    /**
     * Get hero section
     */
    getHero: builder.query<HeroResponse, string>({
      query: (orgId) => `/${orgId}/hero`,
      providesTags: (result, error, orgId) => [
        { type: 'Content', id: `hero-${orgId}` },
      ],
    }),

    /**
     * Update hero section
     */
    updateHero: builder.mutation<
      HeroResponse,
      { orgId: string; heroData: UpdateHeroRequest }
    >({
      query: ({ orgId, heroData }) => ({
        url: `/${orgId}/hero`,
        method: 'PUT',
        body: {
          data: {
            type: 'hero',
            attributes: heroData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `hero-${orgId}` },
      ],
    }),

    // ========================================================================
    // BRANDING
    // ========================================================================

    /**
     * Get branding
     */
    getBranding: builder.query<BrandingResponse, string>({
      query: (orgId) => `/${orgId}/branding`,
      providesTags: (result, error, orgId) => [
        { type: 'Content', id: `branding-${orgId}` },
      ],
    }),

    /**
     * Update branding
     */
    updateBranding: builder.mutation<
      BrandingResponse,
      { orgId: string; brandingData: UpdateBrandingRequest }
    >({
      query: ({ orgId, brandingData }) => ({
        url: `/${orgId}/branding`,
        method: 'PUT',
        body: {
          data: {
            type: 'branding',
            attributes: brandingData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `branding-${orgId}` },
      ],
    }),

    // ========================================================================
    // NEWS/NOTIFICATIONS
    // ========================================================================

    /**
     * Get all news items
     */
    getNews: builder.query<NewsListResponse, string>({
      query: (orgId) => `/${orgId}/news`,
      providesTags: (result, error, orgId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Content' as const,
                id,
              })),
              { type: 'Content', id: `news-list-${orgId}` },
            ]
          : [{ type: 'Content', id: `news-list-${orgId}` }],
    }),

    /**
     * Create news item
     */
    createNews: builder.mutation<
      NewsResponse,
      { orgId: string; newsData: CreateNewsRequest }
    >({
      query: ({ orgId, newsData }) => ({
        url: `/${orgId}/news`,
        method: 'POST',
        body: {
          data: {
            type: 'news',
            attributes: {
              ...newsData,
              publishedAt:
                newsData.publishedAt || Math.floor(Date.now() / 1000),
            },
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `news-list-${orgId}` },
      ],
    }),

    /**
     * Update news item
     */
    updateNews: builder.mutation<
      NewsResponse,
      { orgId: string; newsId: string; newsData: UpdateNewsRequest }
    >({
      query: ({ orgId, newsId, newsData }) => ({
        url: `/${orgId}/news/${newsId}`,
        method: 'PUT',
        body: {
          data: {
            type: 'news',
            attributes: newsData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { newsId, orgId }) => [
        { type: 'Content', id: newsId },
        { type: 'Content', id: `news-list-${orgId}` },
      ],
    }),

    /**
     * Delete news item
     */
    deleteNews: builder.mutation<void, { orgId: string; newsId: string }>({
      query: ({ orgId, newsId }) => ({
        url: `/${orgId}/news/${newsId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { newsId, orgId }) => [
        { type: 'Content', id: newsId },
        { type: 'Content', id: `news-list-${orgId}` },
      ],
    }),

    // ========================================================================
    // STATS
    // ========================================================================

    /**
     * Get stats
     */
    getStats: builder.query<StatsResponse, string>({
      query: (orgId) => `/${orgId}/stats`,
      providesTags: (result, error, orgId) => [
        { type: 'Content', id: `stats-${orgId}` },
      ],
    }),

    /**
     * Create stat
     */
    createStat: builder.mutation<
      { data: StatsResponse['data'][0] },
      { orgId: string; statData: CreateStatRequest }
    >({
      query: ({ orgId, statData }) => ({
        url: `/${orgId}/stats`,
        method: 'POST',
        body: {
          data: {
            type: 'stats',
            attributes: statData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `stats-${orgId}` },
      ],
    }),

    /**
     * Update stat
     */
    updateStat: builder.mutation<
      { data: StatsResponse['data'][0] },
      { orgId: string; statId: string; statData: UpdateStatRequest }
    >({
      query: ({ orgId, statId, statData }) => ({
        url: `/${orgId}/stats/${statId}`,
        method: 'PUT',
        body: {
          data: {
            type: 'stats',
            attributes: statData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `stats-${orgId}` },
      ],
    }),

    /**
     * Delete stat
     */
    deleteStat: builder.mutation<void, { orgId: string; statId: string }>({
      query: ({ orgId, statId }) => ({
        url: `/${orgId}/stats/${statId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Content', id: `stats-${orgId}` },
      ],
    }),

    // ========================================================================
    // PROGRAMS
    // ========================================================================

    /**
     * Get programs
     */
    getPrograms: builder.query<ProgramsResponse, string>({
      query: (orgId) => `/${orgId}/programs`,
      providesTags: (result, error, orgId) => [
        { type: 'Content', id: `programs-${orgId}` },
      ],
    }),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const {
  // Site Config
  useGetSiteConfigQuery,
  useUpdateSiteConfigMutation,

  // About
  useGetAboutQuery,
  useUpdateAboutMutation,

  // Hero
  useGetHeroQuery,
  useUpdateHeroMutation,

  // Branding
  useGetBrandingQuery,
  useUpdateBrandingMutation,

  // News
  useGetNewsQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,

  // Stats
  useGetStatsQuery,
  useCreateStatMutation,
  useUpdateStatMutation,
  useDeleteStatMutation,

  // Programs
  useGetProgramsQuery,
} = organizationApi;
