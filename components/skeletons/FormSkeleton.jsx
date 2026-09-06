import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Form Page Header Placeholder */}
      <div className="space-y-3">
        <Skeleton className="h-8 sm:h-10 w-64 rounded-xl" />
        <Skeleton className="h-5 w-52 rounded-full" />
      </div>

      {/* About You Section Card Placeholder */}
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-8 space-y-6">
        <Skeleton className="h-6 w-36 rounded-md mb-2" />

        {/* 2-Column Responsive Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 24, id: 1 },
            { label: 32, id: 2 },
            { label: 20, id: 3 },
            { label: 28, id: 4 },
            { label: 32, id: 5 },
            { label: 24, id: 6 },
          ].map((item) => (
            <div key={item.id} className="space-y-2">
              <Skeleton className={`h-3.5 w-${item.label} rounded`} />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Why Join Textarea Placeholder */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3.5 w-64 rounded" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      {/* Department Questionnaire Card Placeholder */}
      <div className="rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-8 space-y-6">
        <Skeleton className="h-6 w-48 rounded-md mb-2" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-72 rounded" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-56 rounded" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Submit Action Button Placeholder */}
      <div className="pt-2">
        <Skeleton className="h-12 w-full rounded-xl shadow-md" />
      </div>
    </div>
  );
}
