"use client";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface AuthRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthRequired({ children, fallback }: AuthRequiredProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex h-[300px] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Authentication Required</h2>
        <p className="mt-2 text-muted-foreground">
          Please sign in to access this page.
        </p>
        <div className="mt-4 flex gap-4">
          <Button onClick={() => router.push("/login")}>Sign In</Button>
          <Button variant="outline" onClick={() => router.push("/signup")}>
            Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
