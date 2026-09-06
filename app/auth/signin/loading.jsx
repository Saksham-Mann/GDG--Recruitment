import React from "react";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import AuthSkeleton from "@/components/skeletons/AuthSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";

export default function SignInLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
      <NavSkeleton />
      <main className="flex-1 flex items-center justify-center py-12">
        <AuthSkeleton />
      </main>
      <FooterSkeleton />
    </div>
  );
}
