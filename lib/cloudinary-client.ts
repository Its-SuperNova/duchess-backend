/**
 * Client-side utilities for Cloudinary image transformations
 * These functions work with Cloudinary URLs without importing the server package
 */

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  cloudinaryUrl: string,
  transformation: string = "w_auto"
): string {
  if (!cloudinaryUrl || !cloudinaryUrl.includes("cloudinary.com")) {
    return cloudinaryUrl;
  }

  // Handle already transformed URLs (containing /image/upload/)
  if (cloudinaryUrl.includes("/image/upload/")) {
    // If it's already a transformed URL, just add our transformation
    const parts = cloudinaryUrl.split("/image/upload/");
    if (parts.length === 2) {
      const [baseUrl, rest] = parts;
      // Check if there are already transformations
      if (rest.includes("/")) {
        // There are existing transformations, add ours
        return `${baseUrl}/image/upload/${transformation}/${rest}`;
      } else {
        // No existing transformations, add ours
        return `${baseUrl}/image/upload/${transformation}/${rest}`;
      }
    }
  }

  // Handle raw Cloudinary URLs (without transformations)
  const urlParts = cloudinaryUrl.split("/");
  const cloudNameIndex = urlParts.findIndex((part) =>
    part.includes("cloudinary.com")
  );

  if (cloudNameIndex === -1) {
    return cloudinaryUrl;
  }

  const cloudName = urlParts[cloudNameIndex - 1];
  const publicId = urlParts
    .slice(cloudNameIndex + 1)
    .join("/")
    .split(".")[0];

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(
  cloudinaryUrl: string,
  width: number = 300
): string {
  return getOptimizedImageUrl(cloudinaryUrl, `w_${width},c_scale`);
}

/**
 * Get original quality image URL without any transformations
 */
export function getOriginalImageUrl(cloudinaryUrl: string): string {
  if (!cloudinaryUrl || !cloudinaryUrl.includes("cloudinary.com")) {
    return cloudinaryUrl;
  }

  // For now, just return the original URL as-is to avoid URL parsing issues
  // The images should already be in high quality from our upload configuration
  return cloudinaryUrl;
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(cloudinaryUrl: string) {
  return {
    thumbnail: getThumbnailUrl(cloudinaryUrl, 150),
    small: getThumbnailUrl(cloudinaryUrl, 300),
    medium: getThumbnailUrl(cloudinaryUrl, 600),
    large: getThumbnailUrl(cloudinaryUrl, 1200),
    original: getOriginalImageUrl(cloudinaryUrl),
  };
}
