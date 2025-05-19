import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProcessFlow',
  description: '',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // No <body> here! Just return children.
  return <>{children}</>;
}
