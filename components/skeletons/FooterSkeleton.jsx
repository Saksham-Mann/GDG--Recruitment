import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FooterSkeleton() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          {/* Brand Placeholder */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>

          {/* Links Placeholder */}
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
          </div>

          {/* Social Icons Placeholder */}
          <div className="flex justify-center md:justify-end gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
