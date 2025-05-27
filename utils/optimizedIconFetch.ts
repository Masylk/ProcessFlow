import { iconCache } from './iconCache';
import { fetchSignedUrl } from './supabase/fetch_url';

interface IconData {
  basicUrl: string;
  signedUrl: string;
}

interface BatchSignedUrlResult {
  path: string;
  signedUrl: string | null;
  error: string | null;
}

/**
 * Fetch signed URLs for multiple icons using batch API with caching and fallback
 */
export const fetchIconsBatch = async (
  applist: string[],
  iconlist: string[]
): Promise<{ applistResult: IconData[]; iconlistResult: IconData[] }> => {
  try {
    // Prepare all paths
    const appPaths = applist.map((app: string) => `step-icons/apps/${app}`);
    const iconPaths = iconlist.map((icon: string) => `step-icons/default-icons/${icon}`);
    const allPaths = [...appPaths, ...iconPaths];

    // Check cache first and separate cached vs uncached
    const cachedResults = new Map<string, string>();
    const uncachedPaths: string[] = [];

    for (const path of allPaths) {
      const cached = iconCache.get(path);
      if (cached) {
        cachedResults.set(path, cached);
      } else {
        uncachedPaths.push(path);
      }
    }

    console.log(`Icon fetch: ${cachedResults.size} cached, ${uncachedPaths.length} to fetch`);

    // Fetch uncached URLs using batch API
    const newSignedUrls = new Map<string, string>();
    
    if (uncachedPaths.length > 0) {
      try {
        const batchResponse = await fetch('/api/batch-signed-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: uncachedPaths })
        });

        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          
          // Process batch results
          batchData.signedUrls.forEach((result: BatchSignedUrlResult) => {
            if (result.signedUrl && !result.error) {
              newSignedUrls.set(result.path, result.signedUrl);
              iconCache.set(result.path, result.signedUrl);
            } else {
              console.warn(`Failed to get signed URL for ${result.path}:`, result.error);
            }
          });
        } else {
          throw new Error(`Batch API failed with status: ${batchResponse.status}`);
        }
      } catch (batchError) {
        console.warn('Batch fetch failed, falling back to individual requests:', batchError);
        
        // Fallback: fetch individually using existing method
        const individualPromises = uncachedPaths.map(async (path) => {
          try {
            const signedUrl = await fetchSignedUrl(path);
            if (signedUrl) {
              newSignedUrls.set(path, signedUrl);
              iconCache.set(path, signedUrl);
            }
          } catch (error) {
            console.warn(`Failed to fetch individual signed URL for ${path}:`, error);
          }
        });

        await Promise.allSettled(individualPromises);
      }
    }

    // Combine cached and new results
    const getSignedUrl = (path: string): string => {
      return cachedResults.get(path) || newSignedUrls.get(path) || '';
    };

    // Build final results
    const applistResult: IconData[] = applist.map((app: string, idx: number) => ({
      basicUrl: appPaths[idx],
      signedUrl: getSignedUrl(appPaths[idx])
    }));

    const iconlistResult: IconData[] = iconlist.map((icon: string, idx: number) => ({
      basicUrl: iconPaths[idx],
      signedUrl: getSignedUrl(iconPaths[idx])
    }));

    return { applistResult, iconlistResult };

  } catch (error) {
    console.error('Error in fetchIconsBatch:', error);
    
    // Ultimate fallback: return empty signed URLs, let individual components handle loading
    const applistResult: IconData[] = applist.map((app: string) => ({
      basicUrl: `step-icons/apps/${app}`,
      signedUrl: ''
    }));

    const iconlistResult: IconData[] = iconlist.map((icon: string) => ({
      basicUrl: `step-icons/default-icons/${icon}`,
      signedUrl: ''
    }));

    return { applistResult, iconlistResult };
  }
};

/**
 * Preload critical icons (first N icons) for better perceived performance
 */
export const preloadCriticalIcons = async (iconUrls: string[], maxPreload = 20): Promise<void> => {
  if (typeof window === 'undefined') return; // Skip on server side

  const urlsToPreload = iconUrls.filter(url => url).slice(0, maxPreload);
  
  const preloadPromises = urlsToPreload.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't fail the whole batch if one image fails
      img.src = url;
      
      // Timeout after 5 seconds to avoid hanging
      setTimeout(() => resolve(), 5000);
    });
  });

  try {
    await Promise.allSettled(preloadPromises);
    console.log(`Preloaded ${urlsToPreload.length} critical icons`);
  } catch (error) {
    console.warn('Icon preloading failed:', error);
  }
}; 