import { sanitizeInput } from '../app/utils/sanitize';

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
  });

  it('removes control characters', () => {
    expect(sanitizeInput('test\u0000\u0001')).toBe('test');
  });

  it('removes script tags and angle brackets', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitizeInput('a<b>c')).toBe('ac');
    expect(sanitizeInput('a>c')).toBe('ac');
  });
}); 