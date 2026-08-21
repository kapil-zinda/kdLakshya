/**
 * RTK Query API for S3 File Operations
 * Handles S3 signed URLs for file uploads and viewing
 */

import { workspaceApi } from './baseApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface S3SignedUrlRequest {
  type: 'upload';
  id: string;
  attributes: {
    title: string;
    image_type: 'gallery' | 'profile' | 'banner';
  };
}

export interface S3SignedUrlResponse {
  success: true;
  data: {
    signed_url: string;
    file_path: string;
    bucket: string;
    expires_in: number;
    upload_id: string;
  };
}

export interface S3ViewSignedUrlRequest {
  file_path: string;
}

export interface S3ViewSignedUrlResponse {
  success: true;
  data: {
    signed_url: string;
    expires_in: number;
  };
}

// ============================================================================
// RTK QUERY API ENDPOINTS
// ============================================================================

export const s3Api = workspaceApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get S3 signed URL for file upload
     */
    getS3UploadUrl: builder.mutation<S3SignedUrlResponse, S3SignedUrlRequest>({
      query: (requestData) => ({
        url: '/s3/signed-url',
        method: 'POST',
        body: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    /**
     * Get CloudFront signed URL for viewing uploaded files
     */
    getS3ViewUrl: builder.mutation<
      S3ViewSignedUrlResponse,
      S3ViewSignedUrlRequest
    >({
      query: (requestData) => ({
        url: '/s3/view-signed-url',
        method: 'POST',
        body: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),

  overrideExisting: false,
});

// ============================================================================
// EXPORT HOOKS
// ============================================================================

export const { useGetS3UploadUrlMutation, useGetS3ViewUrlMutation } = s3Api;
