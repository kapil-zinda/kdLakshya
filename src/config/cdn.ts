/**
 * CDN Configuration
 * CloudFront URL for serving uploaded files
 */

export const CLOUDFRONT_URL =
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
  'https://d2kwquvuus8ixo.cloudfront.net';

/**
 * Helper to construct full CDN URL from file path
 * @param filePath - The S3 file path
 * @returns Full CloudFront URL or original URL if already complete
 */
export function getCDNUrl(filePath: string): string {
  if (!filePath) return '';

  // If already a complete URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Construct CloudFront URL
  return `${CLOUDFRONT_URL}/${filePath}`;
}
