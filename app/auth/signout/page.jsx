"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        if (typeof window !== "undefined") {
          try {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("recruitment-draft:") || key.startsWith("gdg_") || key.includes("draft")) {
                localStorage.removeItem(key);
              }
            });
            Object.keys(sessionStorage).forEach((key) => {
              if (key.startsWith("submitted_depts_")) {
                sessionStorage.removeItem(key);
              }
            });
          } catch (storageErr) {
            console.warn("Draft cleanup on signout warning:", storageErr);
          }
        }
        await authClient.signOut();
        toast.success("Signed out successfully", { duration: 900, dismissible: true });
        router.push("/");
      } catch (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out", { duration: 2000 });
        router.push("/");
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Card className="flex flex-col items-center gap-4 p-8 max-w-sm text-center shadow-lg border-border/60 bg-card/80 backdrop-blur-md rounded-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Signing Out</h2>
          <p className="text-xs text-muted-foreground">
            Please wait while your session is securely terminated...
          </p>
        </div>
      </Card>
    </div>
  );
} 