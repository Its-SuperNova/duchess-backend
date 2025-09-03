import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
}

/**
 * Upload image to Cloudinary from server-side
 */
export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options.folder || "duchess-pastries",
            public_id: options.public_id,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                secure_url: result.secure_url!,
                public_id: result.public_id!,
                width: result.width!,
                height: result.height!,
                format: result.format!,
                bytes: result.bytes!,
              });
            } else {
              reject(new Error("Upload failed"));
            }
          }
        );

        uploadStream.end(fileBuffer);
      }
    );

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Provide more specific error messages
    if (error && typeof error === "object" && "message" in error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }

    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

// Note: Client-side image transformation functions are in lib/cloudinary-client.ts
// This file is for server-side operations only

export default cloudinary;
