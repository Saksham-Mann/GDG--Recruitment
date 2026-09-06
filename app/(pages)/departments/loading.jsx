import React from "react";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import DepartmentGridSkeleton from "@/components/skeletons/DepartmentGridSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";

export default function DepartmentsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
      <NavSkeleton />
      <main className="flex-1 py-12">
        <DepartmentGridSkeleton count={9} showHeader={true} />
      </main>
      <FooterSkeleton />
    </div>
  );
}
