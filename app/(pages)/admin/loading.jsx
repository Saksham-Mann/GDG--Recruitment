import React from "react";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import AdminSkeleton from "@/components/skeletons/AdminSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
      <NavSkeleton />
      <main className="flex-1 py-8">
        <AdminSkeleton />
      </main>
      <FooterSkeleton />
    </div>
  );
}
