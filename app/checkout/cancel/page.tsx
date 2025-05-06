import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Mark as dynamic to ensure it's not cached
export const dynamic = 'force-dynamic';

interface SearchParams {
  workspace?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CheckoutCancelPage(props: PageProps) {
  // Await searchParams before using in Next.js 15
  const searchParams = await props.searchParams;
  
  // Get the workspace ID from the resolved params
  const workspaceId = searchParams.workspace;

  if (!workspaceId) {
    console.error('No workspace ID provided');
    throw redirect('/');
  }

  // Redirect to the dashboard with cancelled parameter
  throw redirect(`/dashboard?workspace=${workspaceId}&checkout=cancelled`);
} 