# Cloudinary Integration Setup

This document explains how to set up Cloudinary for image storage in the Duchess Pastries application.

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## How to Get Cloudinary Credentials

1. **Sign up for Cloudinary**: Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. **Get your Cloud Name**: This is shown on your dashboard
3. **Get API Key and Secret**: Found in your account settings under "API Keys"

## What This Integration Does

### Before (Base64 Storage)

- Images were converted to Base64 strings using JavaScript FileReader
- These long strings (10,000+ characters) were stored directly in the database
- Performance issues due to large database fields
- No image optimization

### After (Cloudinary Storage)

- Images are uploaded directly to Cloudinary's CDN
- Only the Cloudinary URL is stored in the database
- Automatic image optimization and transformations
- Responsive images for different screen sizes
- Better performance and scalability

## Image Transformations

The integration automatically applies these transformations:

- **Format**: Auto-format selection (WebP, AVIF when supported)
- **Quality**: Auto-optimization
- **Thumbnails**: Different sizes for different use cases
- **Responsive**: Multiple sizes for different screen densities

## File Size Limits

- **Maximum file size**: 5MB (increased from 2MB)
- **Supported formats**: PNG, JPG, GIF
- **Automatic optimization**: Images are compressed and optimized

## Security

- **Signed uploads**: Server-side uploads for security
- **Folder organization**: Images are organized in folders (products/banner, products/gallery, categories)
- **Public access**: Images are publicly accessible (required for frontend display)

## Migration Notes

- Existing Base64 images in the database will continue to work
- New uploads will use Cloudinary
- Consider migrating existing images to Cloudinary for better performance

