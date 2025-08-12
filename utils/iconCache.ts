// utils/iconCache.ts

interface CachedIcon {
  signedUrl: string;
  expiresAt: number;
}

interface BatchSignedUrlResponse {
  signedUrls: Array<{
    path: string;
    signedUrl: string | null;
    error: string | null;
  }>;
}

class IconCache {
  private cache = new Map<string, CachedIcon>();
  private readonly DEFAULT_EXPIRY_HOURS = 23; // Slightly less than 24h to be safe

  /**
   * Set a signed URL in the cache with expiry time
   */
  set(path: string, signedUrl: string, expiryHours = this.DEFAULT_EXPIRY_HOURS): void {
    this.cache.set(path, {
      signedUrl,
      expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000)
    });
  }

  /**
   * Get a signed URL from cache if it exists and hasn't expired
   */
  get(path: string): string | null {
    const cached = this.cache.get(path);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(path);
      return null;
    }

    return cached.signedUrl;
  }

  /**
   * Check if a path exists in cache and is not expired
   */
  has(path: string): boolean {
    return this.get(path) !== null;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [path, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(path);
      }
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { total: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    
    for (const cached of this.cache.values()) {
      if (now > cached.expiresAt) {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      expired
    };
  }
}

// Create a singleton instance
export const iconCache = new IconCache();

// Cleanup expired entries every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    iconCache.cleanup();
  }, 30 * 60 * 1000);
} 