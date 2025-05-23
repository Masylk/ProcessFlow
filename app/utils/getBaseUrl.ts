export default function getBaseUrl() {
  // On Vercel, VERCEL_URL is set (e.g. process-flow-abc123.vercel.app)
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  // Fallback for local dev
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}