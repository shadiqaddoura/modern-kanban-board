"use client";

import { ModeToggle } from "@/components/layout/ModeToggle";
import { UserNav } from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/auth-context";
import { KanbanSquare, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  onCreateBoard?: () => void;
}

export function Navbar({ onCreateBoard }: NavbarProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user } = useAuth();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <KanbanSquare className="h-6 w-6" />
          <span className="font-bold">Modern Kanban</span>
        </Link>
        <Separator orientation="vertical" className="mx-4 h-6" />
        {isHomePage && user && (
          <Button onClick={onCreateBoard} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>New Board</span>
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          {user && <UserNav />}
        </div>
      </div>
    </div>
  );
}
