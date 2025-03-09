import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

interface PageParams {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

// Keep params and searchParams as Promises as Next.js 15 expects this
export default async function WorkspaceSlugPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    // Find the workspace by slug
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!workspace) {
      // Redirect to home page if workspace not found
      return redirect('/');
    }

    // Redirect to the dashboard page with the workspace id
    return redirect(`/dashboard?workspace=${workspace.id}`);
  } catch (error) {
    console.error('Error in slug page:', error);
    return redirect('/dashboard');
  }
}

// This satisfies Next.js expectations for static generation
export function generateStaticParams(): { slug: string }[] {
  return [];
}
