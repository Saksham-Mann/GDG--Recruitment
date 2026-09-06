import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Announcement Badge Placeholder */}
        <Skeleton className="mx-auto h-7 w-56 rounded-full" />

        {/* Hero Main Headline Placeholder */}
        <div className="mt-8 space-y-3">
          <Skeleton className="mx-auto h-10 sm:h-14 w-4/5 max-w-2xl rounded-2xl" />
          <Skeleton className="mx-auto h-10 sm:h-14 w-2/3 max-w-lg rounded-2xl" />
        </div>

        {/* Description Subtitle Placeholder */}
        <div className="mx-auto mt-6 max-w-2xl space-y-2">
          <Skeleton className="mx-auto h-4 w-full rounded-md" />
          <Skeleton className="mx-auto h-4 w-4/5 rounded-md" />
        </div>

        {/* CTA Buttons Placeholder */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Skeleton className="h-12 w-48 rounded-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>

        {/* Feature Highlights Grid Placeholder */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-3"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <div className="space-y-1.5 pt-1">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-4/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
