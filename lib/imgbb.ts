/**
 * ImgBB image upload utility
 * Uploads an image file to ImgBB and returns the hosted display URL
 */
export async function uploadToImgBB(file: File): Promise<string> {
  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
  }

  // Validate size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 5MB");
  }

  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey || apiKey === "placeholder" || apiKey === "your_imgbb_api_key_here") {
    // Return a dummy fallback avatar if API key is not yet configured by the user
    console.warn("NEXT_PUBLIC_IMGBB_API_KEY is not configured. Using placeholder image.");
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Image upload failed");
    }

    return data.data.display_url || data.data.url;
  } catch (error) {
    console.error("ImgBB upload error:", error);
    throw error instanceof Error ? error : new Error("Failed to upload image");
  }
}
