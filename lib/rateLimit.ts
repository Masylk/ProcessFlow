import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you should use Redis or another distributed store
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: Record<string, RateLimitStore> = {};

export function createRateLimiter(name: string, limit: number, windowMs: number) {
  // Create a new store if it doesn't exist
  if (!stores[name]) {
    stores[name] = {};
  }
  
  const store = stores[name];
  
  // Clean up expired entries periodically
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    });
  }, 60 * 1000); // Clean up every minute
  
  return async function rateLimit(request: Request) {
    // Get client IP address (handle both NextRequest and standard Request)
    let ip = 'unknown';
    
    // Check if headers.get is available (standard for Request)
    if (request.headers && typeof request.headers.get === 'function') {
      ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
    }
    
    const now = Date.now();
    
    // Reset rate limit if the window has passed
    if (!store[ip] || store[ip].resetTime <= now) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null; // No rate limit exceeded
    }
    
    // Increment count
    store[ip].count += 1;
    
    // Check if rate limit is exceeded
    if (store[ip].count > limit) {
      // Calculate remaining time until reset
      const resetInSecs = Math.ceil((store[ip].resetTime - now) / 1000);
      
      // Return rate limit response
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          message: `Rate limit exceeded. Try again in ${resetInSecs} seconds.` 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(resetInSecs),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(store[ip].resetTime / 1000)),
          }
        }
      );
    }
    
    // Return null if rate limit is not exceeded
    return null;
  };
}

// Common rate limiters
export const subscriptionRateLimiter = createRateLimiter('subscription', 10, 60 * 1000); // 10 requests per minute
export const checkoutRateLimiter = createRateLimiter('checkout', 5, 60 * 1000); // 5 requests per minute
export const webhookRateLimiter = createRateLimiter('webhook', 100, 60 * 1000); // 100 requests per minute (webhooks need higher limits) 