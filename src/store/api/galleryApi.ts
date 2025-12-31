/**
 * RTK Query API for Public Gallery
 * Handles public gallery images without authentication
 */

import { publicApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GalleryImage {
  id: string;
  orgId: string;
  image_url: string;
  title: string;
  description: string;
  tags: string[];
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface GalleryResponse {
  data: {
    type: 'gallery';
    id: string;
    attributes: GalleryImage;
  }[];
}

export interface GalleryQueryParams {
  tags?: string;
  active_only?: 'true' | 'false';
  upload_id?: string;
}

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const galleryApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get gallery images (public endpoint - no auth required)
     */
    getGallery: builder.query<
      GalleryResponse,
      { orgId: string; params?: GalleryQueryParams }
    >({
      query: ({ orgId, params }) => {
        const searchParams = new URLSearchParams();
        if (params?.tags) searchParams.append('tags', params.tags);
        if (params?.active_only)
          searchParams.append('active_only', params.active_only);
        if (params?.upload_id)
          searchParams.append('upload_id', params.upload_id);

        const queryString = searchParams.toString();
        return `/${orgId}/gallery${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { orgId }) => [
        { type: 'Gallery', id: orgId },
      ],
    }),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const { useGetGalleryQuery } = galleryApi;
