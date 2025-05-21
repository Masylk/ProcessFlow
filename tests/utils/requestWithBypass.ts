import request, { Test } from 'supertest';

/**
 * Returns a supertest Test with the Vercel protection bypass header set (if available).
 * Usage: requestWithBypass(BASE_URL, 'get', '/api/hello')...
 */
export function requestWithBypass(
  baseUrl: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options',
  url: string | URL
): Test {
  const test = request(baseUrl)[method](typeof url === 'string' ? url : url.toString());
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return bypass
    ? test.set('x-vercel-protection-bypass', bypass)
    : test;
} 