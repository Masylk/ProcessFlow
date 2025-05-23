export function isPreview(): boolean {
  return process.env.VERCEL_ENV !== "production";
}
