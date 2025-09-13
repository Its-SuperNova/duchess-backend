import { useState } from "react";

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Create FormData
      const formData = new FormData();
      formData.append("image", file);
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      // Upload to our API endpoint
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || errorData.details || "Upload failed";
        } catch (jsonError) {
          // If JSON parsing fails, use the response status text
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (!result.data || !result.data.secure_url) {
        throw new Error("Invalid response format from server");
      }

      const imageUrl = result.data.secure_url;

      // Log successful upload
      console.log("✅ Image uploaded successfully:", {
        url: imageUrl,
        folder: options.folder || "duchess-pastries",
        publicId: result.data.public_id,
        timestamp: new Date().toISOString(),
      });

      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(imageUrl);
      }

      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);

      // Call error callback
      if (options.onError) {
        options.onError(errorMessage);
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
  };
}
