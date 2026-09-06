import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NavSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-2.5 w-20 rounded-md" />
          </div>
        </div>

        {/* Desktop Navigation Links Placeholder */}
        <div className="hidden md:flex items-center gap-2 p-1 rounded-full border border-border/40 bg-muted/20">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        {/* Action Controls Placeholder */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Placeholder */}
          <Skeleton className="h-9 w-9 rounded-xl" />

          {/* Auth Buttons Placeholder */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>

          {/* Mobile Drawer Trigger Placeholder */}
          <Skeleton className="md:hidden h-9 w-9 rounded-xl" />
        </div>
      </div>
    </header>
  );
}
