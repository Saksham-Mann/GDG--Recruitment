import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentGridSkeleton({ count = 6, showHeader = true }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showHeader && (
        <div className="text-center mb-10 space-y-3">
          <Skeleton className="h-8 sm:h-10 w-64 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-xl mx-auto rounded-md" />
        </div>
      )}

      {/* Grid matching mobile (1 col), tablet (2 col), desktop (3 col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/60 bg-card/60 p-6 flex flex-col justify-between min-h-[220px] space-y-5"
          >
            {/* Top icon and badge */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Department Title & Description lines */}
            <div className="space-y-2.5">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-5/6 rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>

            {/* Card Action / Footer Button */}
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
