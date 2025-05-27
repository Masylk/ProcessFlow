import { redirect } from 'next/navigation';
import prismaSingleton from '@/lib/prisma';
import { isVercel } from '@/app/api/utils/isVercel';
import { PrismaClient } from '@prisma/client';

interface PageParams {
  slug: string;
}

interface SearchParams {
  checkout?: string;
  session_id?: string;
}

// Valid checkout status types
const VALID_CHECKOUT_STATUSES = ['success', 'cancelled'] as const;
type CheckoutStatus = (typeof VALID_CHECKOUT_STATUSES)[number];

// Validate checkout status
function isValidCheckoutStatus(
  status: string | undefined
): status is CheckoutStatus {
  return (
    typeof status === 'string' &&
    VALID_CHECKOUT_STATUSES.includes(status as CheckoutStatus)
  );
}

// Configure page behavior
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}

export default async function WorkspaceSlugPage(props: PageProps) {
  // Await params before destructuring in Next.js 15
  const params = await props.params;
  const searchParams = await props.searchParams;

  const slug = params.slug;

  // Use a new PrismaClient on Vercel, otherwise use the singleton
  const prisma = isVercel() ? new PrismaClient() : prismaSingleton;

  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  // Find the workspace by slug
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!workspace) {
    return redirect('/');
  }

  // Build the target URL
  const baseUrl = '/';
  const workspaceParam = `workspace=${workspace.id}`;

  // Only add checkout param if it's from Stripe
  const checkoutParam = searchParams.checkout
    ? `&checkout=${searchParams.checkout}`
    : '';
  const sessionParam = searchParams.session_id
    ? `&session_id=${searchParams.session_id}`
    : '';

  if (checkoutParam || sessionParam) {
    const targetUrl = `${baseUrl}?${workspaceParam}${checkoutParam}${sessionParam}`;
    return redirect(targetUrl);
  }

  return redirect(baseUrl);
}
