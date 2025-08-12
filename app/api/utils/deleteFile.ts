import { supabase } from '@/lib/supabaseClient';

/**
 * Deletes a file from Supabase storage given its public URL.
 * @param fileUrl The public URL of the file to delete.
 */
export async function deleteFile(fileUrl: string | null) {
  if (!fileUrl) return;

  const filePath = fileUrl.replace(
    'https://your-project.supabase.co/storage/v1/object/public/',
    ''
  );

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;
  if (!bucketName) {
    console.error('Bucket name is not defined in the environment variables.');
    return;
  }

  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    console.error(`Failed to delete file: ${fileUrl}`, error);
  }
}

/**
 * Deletes a user avatar from the Supabase private bucket given its storage path.
 * @param avatarPath The storage path of the avatar to delete (e.g., userUID/avatars/filename.png)
 */
export async function deleteAvatarFromPrivateBucket(avatarPath: string | null) {
  if (!avatarPath) return;

  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
  if (!bucketName) {
    console.error('Private bucket name is not defined in the environment variables.');
    return;
  }

  const { error } = await supabase.storage.from(bucketName).remove([avatarPath]);

  if (error) {
    console.error(`Failed to delete avatar from private bucket: ${avatarPath}`, error);
  }
} 