/**
 * Converts a Google Drive sharing link to a direct image URL
 * @param url - The Google Drive sharing URL
 * @returns Direct image URL or original URL if not a Google Drive link
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;

  // Check if it's a Google Drive link in sharing format
  const googleDriveRegex = /drive\.google\.com\/file\/d\/([^/]+)/;
  const match = url.match(googleDriveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    // Convert to direct image URL format
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Return original URL if not a Google Drive link or already in correct format
  return url;
}
