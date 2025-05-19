"use client";
import { usePathname } from "next/navigation";

export function BodyClassProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith("/onboarding");
  return (
    <body className={`font-sans overflow-hidden${isOnboarding ? " force-light-theme" : ""}`}>
      {children}
    </body>
  );
}
