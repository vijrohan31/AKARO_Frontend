"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        if (sessionStorage.getItem("akaro_is_logged_out") === "true") {
          if (isMounted) setIsChecking(false);
          return;
        }
      } catch (e) {}

      try {
        const profile = await authApi.fetchProfile();
        
        const hasSuccess = !!(profile && typeof profile === 'object' && Object.keys(profile).length > 0 && (profile as any).is_successful === true);

        if (isMounted && hasSuccess) {
          window.location.href = "/dashboard";
        } else {
          if (isMounted) setIsChecking(false);
        }
      } catch (error) {
        if (isMounted) setIsChecking(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
