"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function BodyClassProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding") ?? false;
  
  useEffect(() => {
    if (isOnboarding) {
      document.body.classList.add("force-light-theme");
    } else {
      document.body.classList.remove("force-light-theme");
    }
  }, [isOnboarding]);

  return children;
}
