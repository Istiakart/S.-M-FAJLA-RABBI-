
import { put } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob Storage.
 * Attempts to get token from localStorage first (for admin flexibility),
 * then falls back to process.env.
 */
export const uploadFile = async (file: File | Blob, folder: string = 'uploads') => {
  const filename = `${folder}/${Date.now()}-${(file as File).name || 'blob'}`;
  
  // Try to get token from localStorage (set via Admin Panel) or process.env
  const token = localStorage.getItem('vercel_blob_token') || (process.env as any).BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error("Vercel Blob Token is missing. Please set it in the Admin Panel or Environment Variables.");
  }

  try {
    const { url } = await put(filename, file, {
      access: 'public',
      token: token,
    });
    return url;
  } catch (error) {
    console.error("Blob Upload Failed:", error);
    throw error;
  }
};

/**
 * Helper to validate file types for marketing assets
 */
export const isValidFileType = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'];
  return validTypes.includes(file.type);
};
