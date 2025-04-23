"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <span className="ml-2 text-muted-foreground">{text}</span>}
    </div>
  );
}
