/**
 * RTK Query API for Public Gallery
 * Handles public gallery images without authentication
 * Also includes authenticated mutations for gallery management
 */

import { baseApi, publicApi } from './baseApi';

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

export interface CreateGalleryImageRequest {
  image_url: string;
  title: string;
  description: string;
  tags: string[];
  order?: number;
  active?: boolean;
}

export interface UpdateGalleryImageRequest {
  image_url?: string;
  title?: string;
  description?: string;
  tags?: string[];
  order?: number;
  active?: boolean;
}

export interface GalleryImageResponse {
  data: {
    type: 'gallery';
    id: string;
    attributes: GalleryImage;
  };
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

// Authenticated Gallery Management API (uses baseApi with auth)
export const galleryManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Create gallery image (authenticated)
     */
    createGalleryImage: builder.mutation<
      GalleryImageResponse,
      { orgId: string; imageData: CreateGalleryImageRequest }
    >({
      query: ({ orgId, imageData }) => ({
        url: `/${orgId}/gallery`,
        method: 'POST',
        body: {
          data: {
            type: 'gallery',
            attributes: imageData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Gallery', id: orgId },
      ],
    }),

    /**
     * Update gallery image (authenticated)
     */
    updateGalleryImage: builder.mutation<
      GalleryImageResponse,
      { orgId: string; imageId: string; imageData: UpdateGalleryImageRequest }
    >({
      query: ({ orgId, imageId, imageData }) => ({
        url: `/${orgId}/gallery/${imageId}`,
        method: 'PUT',
        body: {
          data: {
            type: 'gallery',
            attributes: imageData,
          },
        },
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      }),
      invalidatesTags: (result, error, { orgId }) => [
        { type: 'Gallery', id: orgId },
      ],
    }),

    /**
     * Delete gallery image (authenticated)
     */
    deleteGalleryImage: builder.mutation<
      void,
      { orgId: string; imageId: string }
    >({
      query: ({ orgId, imageId }) => ({
        url: `/${orgId}/gallery/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { orgId }) => [
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

export const {
  useCreateGalleryImageMutation,
  useUpdateGalleryImageMutation,
  useDeleteGalleryImageMutation,
} = galleryManagementApi;
