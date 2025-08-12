import { generateUserUrl } from "./generateUserUrl";

/**
 * Generates a public URL for a file in the Supabase storage bucket
 * @param path - The path of the file in the storage bucket
 * @returns The complete public URL for the file
 * @throws Error if required environment variables are missing
 */
export function generateWorkspaceURL(path: string): string {
    // Get the environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const storagePath = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_STORAGE_PATH;
    const userStoragePath = process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH;
    
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in the environment variables');
    }
  
    if (!storagePath) {
      throw new Error('NEXT_PUBLIC_SUPABASE_WORKSPACE_STORAGE_PATH is not defined in the environment variables');
    }
  
    if (!path) {
      throw new Error('Path is required to generate public URL');
    }
  
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
    // Build and return the public URL
    return `${supabaseUrl}${storagePath}/${cleanPath}`;
  }
  