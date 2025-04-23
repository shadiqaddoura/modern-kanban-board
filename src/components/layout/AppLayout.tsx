"use client";

import { AuthRequired } from "@/components/auth/AuthRequired";
import { Navbar } from "@/components/layout/Navbar";
import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  onCreateBoard?: () => void;
  requireAuth?: boolean;
}

export function AppLayout({
  children,
  onCreateBoard,
  requireAuth = true
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onCreateBoard={onCreateBoard} />
      <main className="flex-1 p-4 md:p-6">
        {requireAuth ? (
          <AuthRequired>{children}</AuthRequired>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
