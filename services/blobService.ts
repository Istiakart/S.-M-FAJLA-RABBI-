
import { put } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob Storage.
 * If no token is found, it falls back to a local Object URL for preview purposes.
 */
export const uploadFile = async (file: File | Blob, folder: string = 'uploads') => {
  const filename = `${folder}/${Date.now()}-${(file as File).name || 'blob'}`;
  
  // Try to get token from localStorage (set via Admin Panel) or process.env
  const token = localStorage.getItem('vercel_blob_token') || 
                (process.env as any).BLOB_READ_WRITE_TOKEN || 
                'vercel_blob_rw_VUtsEkzfzGVv08nc_NMqC7duv3gRz9PojgHDMQ5kdRgT0Lu';

  if (!token || token === 'undefined' || token === 'null') {
    console.warn("Vercel Blob Token is missing. Switching to Local Preview Mode (images will not persist after refresh).");
    // Fallback: Return a local URL so the user can still see the image during the session
    return URL.createObjectURL(file);
  }

  try {
    const { url } = await put(filename, file, {
      access: 'public',
      token: token,
    });
    return url;
  } catch (error) {
    console.error("Blob Upload Failed:", error);
    // If the token is invalid or request fails, fallback to local URL to prevent blocking the UI
    return URL.createObjectURL(file);
  }
};

/**
 * Helper to validate file types for marketing assets
 */
export const isValidFileType = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'];
  return validTypes.includes(file.type);
};
