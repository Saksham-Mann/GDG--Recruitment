"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Lock, User, Sparkles, Eye, EyeOff } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthSkeleton from "@/components/skeletons/AuthSkeleton";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMode = searchParams.get("mode");
  const queryTab = searchParams.get("tab");
  const initialMode = queryMode === "signup" || queryTab === "signup" ? "signup" : "signin";

  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState(initialMode); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync mode if URL query parameter changes
  useEffect(() => {
    if (queryMode === "signup" || queryTab === "signup") {
      setMode("signup");
    } else if (queryMode === "signin" || queryTab === "signin") {
      setMode("signin");
    }
  }, [queryMode, queryTab]);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
        <NavBar />
        <main className="flex-1 flex items-center justify-center py-12">
          <AuthSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Redirecting to candidate portal...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Credentials Incomplete: Email or password field is blank. Please enter both your email address and password to proceed.");
      return;
    }

    if (mode === "signup" && !name) {
      toast.error("Full Name Required: Name field is blank. Please provide your official name as registered with university records.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error(`Account Creation Failed: ${res.error.message || "A user with this email may already exist. Please verify your email address or click Sign In."}`);
        } else {
          toast.success("Account created successfully!");
          router.push("/");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (res?.error) {
          toast.error("Authentication Failed: The email or password entered does not match existing records. Please verify your credentials or click 'Create Account' if you are new.");
        } else {
          toast.success("Signed in successfully!");
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Connection Failed: Unable to reach authentication service. Please check your network connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute -top-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="w-full max-w-md space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none">
          <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle className={`text-2xl font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
                {mode === "signin" ? "Candidate Portal" : "Join the Community"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Enter your credentials to access your application"
                  : "Create an account to start your recruitment journey"}
              </CardDescription>

              {/* Mode Toggle Switcher */}
              <div className="pt-4">
                <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      mode === "signin"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      mode === "signup"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-9 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl h-11 font-semibold shadow-md transition-all hover:shadow-primary/20"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : mode === "signin" ? (
                    "Sign In to Application"
                  ) : (
                    "Create Candidate Account"
                  )}
                </Button>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Homepage</span>
                </Link>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
          <NavSkeleton />
          <main className="flex-1 flex items-center justify-center py-12">
            <AuthSkeleton />
          </main>
          <FooterSkeleton />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
