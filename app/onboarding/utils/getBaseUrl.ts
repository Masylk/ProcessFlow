const baseurl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : `https://${process.env.VERCEL_URL}`;

export default baseurl;