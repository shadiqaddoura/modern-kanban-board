"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export function Error({
  title = "Something went wrong",
  message = "An error occurred while processing your request.",
  retry,
  className,
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center",
        className
      )}
    >
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {retry && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={retry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
