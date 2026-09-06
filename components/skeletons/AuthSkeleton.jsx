import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Header Icon and Title */}
        <div className="text-center space-y-3">
          <Skeleton className="mx-auto h-12 w-12 rounded-2xl" />
          <Skeleton className="mx-auto h-7 w-48 rounded-lg" />
          <Skeleton className="mx-auto h-4 w-64 rounded-md" />
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-xl bg-muted/60 border border-border/40">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>

        {/* Social Auth & Divider Placeholder */}
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex items-center gap-3 py-1">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-px flex-1" />
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Action Button & Back Link */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-11 w-full rounded-xl shadow-md" />
          <Skeleton className="mx-auto h-4 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
