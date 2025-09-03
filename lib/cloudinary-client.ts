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

  // Extract the base URL and public ID
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
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(cloudinaryUrl: string) {
  return {
    thumbnail: getThumbnailUrl(cloudinaryUrl, 150),
    small: getThumbnailUrl(cloudinaryUrl, 300),
    medium: getThumbnailUrl(cloudinaryUrl, 600),
    large: getThumbnailUrl(cloudinaryUrl, 1200),
    original: cloudinaryUrl,
  };
}
