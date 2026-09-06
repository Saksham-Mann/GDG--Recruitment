import React from "react";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import FormSkeleton from "@/components/skeletons/FormSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";

export default function JoinLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
      <NavSkeleton />
      <main className="flex-1 py-8">
        <FormSkeleton />
      </main>
      <FooterSkeleton />
    </div>
  );
}
