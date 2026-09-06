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
import { Loader2, ArrowLeft, Mail, Lock, User, Sparkles, Eye, EyeOff, AlertCircle } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AuthSkeleton from "@/components/skeletons/AuthSkeleton";
import NavSkeleton from "@/components/skeletons/NavSkeleton";
import FooterSkeleton from "@/components/skeletons/FooterSkeleton";
import { cn } from "@/lib/utils";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [authError, setAuthError] = useState("");

  // Sync mode if URL query parameter changes
  useEffect(() => {
    if (queryMode === "signup" || queryTab === "signup") {
      setMode("signup");
    } else if (queryMode === "signin" || queryTab === "signin") {
      setMode("signin");
    }
    setFieldErrors({});
    setAuthError("");
    setGoogleLoading(false);
  }, [queryMode, queryTab]);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const validateField = (fieldName, value, currentMode = mode) => {
    if (fieldName === "email") {
      if (!value || !value.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Invalid email format (e.g. student@example.edu).";
      }
      return "";
    }
    if (fieldName === "password") {
      if (!value) return "Password is required.";
      if (value.length < 6) return "Password must be at least 6 characters.";
      return "";
    }
    if (fieldName === "name" && currentMode === "signup") {
      if (!value || !value.trim()) return "Full Name is required.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    }
    return "";
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const val = fieldName === "name" ? name : fieldName === "email" ? email : password;
    const err = validateField(fieldName, val);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  const handleInputChange = (fieldName, val) => {
    if (fieldName === "name") setName(val);
    if (fieldName === "email") setEmail(val);
    if (fieldName === "password") setPassword(val);
    setAuthError("");

    if (touched[fieldName] || Object.keys(fieldErrors).length > 0) {
      const err = validateField(fieldName, val);
      setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
    }
  };

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
    setAuthError("");

    const newErrors = {};
    if (mode === "signup") {
      const nameErr = validateField("name", name, "signup");
      if (nameErr) newErrors.name = nameErr;
    }
    const emailErr = validateField("email", email, mode);
    if (emailErr) newErrors.email = emailErr;
    const passwordErr = validateField("password", password, mode);
    if (passwordErr) newErrors.password = passwordErr;

    setFieldErrors(newErrors);
    setTouched({ name: true, email: true, password: true });

    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      const firstFieldId = errorFields[0];
      const el = document.getElementById(firstFieldId);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim(),
          callbackURL: "/",
        });
        if (res?.error) {
          setAuthError(res.error.message || "A user with this email may already exist. Please verify your email or click Sign In.");
        } else {
          router.push("/");
        }
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/",
        });
        if (res?.error) {
          setAuthError("Authentication Failed: The email or password entered does not match existing records. Please verify your credentials or click 'Create Account'.");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError("Connection Failed: Unable to reach authentication service. Please check your network connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setGoogleLoading(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: searchParams.get("callbackUrl") || "/",
      });
      if (res?.error) {
        setAuthError(
          res.error.message ||
            "Google Sign-In failed. Please verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in .env.local."
        );
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setAuthError(
        "Google Sign-In is not enabled yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file."
      );
      setGoogleLoading(false);
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
                {mode === "signin" ? "Sign In" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in with Google or enter your credentials"
                  : "Create an account or sign up instantly with Google"}
              </CardDescription>

              {/* Mode Toggle Switcher */}
              <div className="pt-4">
                <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 border border-border/40">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setFieldErrors({});
                      setAuthError("");
                    }}
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
                    onClick={() => {
                      setMode("signup");
                      setFieldErrors({});
                      setAuthError("");
                    }}
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

            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4">
                {/* Social Sign-In (Google) */}
                <Button
                  type="button"
                  variant="outline"
                  id="google-auth-btn"
                  disabled={submitting || googleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 rounded-xl border-border/80 bg-background/60 hover:bg-muted/70 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-xs hover:border-border active:scale-[0.99]"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{mode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium text-[11px] tracking-wider">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className={cn("text-xs font-medium transition-colors", fieldErrors.name ? "text-red-500 font-semibold" : "text-foreground")}>
                      Full Name <span className="text-red-500" aria-hidden="true">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? "name-error" : undefined}
                        className={cn(
                          "pl-9 rounded-xl border bg-background/50 transition-colors",
                          fieldErrors.name ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-border/60 focus-visible:ring-primary"
                        )}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p id="name-error" role="alert" className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none">
                        <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className={cn("text-xs font-medium transition-colors", fieldErrors.email ? "text-red-500 font-semibold" : "text-foreground")}>
                    Email Address <span className="text-red-500" aria-hidden="true">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.edu"
                      value={email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      className={cn(
                        "pl-9 rounded-xl border bg-background/50 transition-colors",
                        fieldErrors.email ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-border/60 focus-visible:ring-primary"
                      )}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className={cn("text-xs font-medium transition-colors", fieldErrors.password ? "text-red-500 font-semibold" : "text-foreground")}>
                    Password <span className="text-red-500" aria-hidden="true">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? "password-error" : undefined}
                      className={cn(
                        "pl-9 pr-10 rounded-xl border bg-background/50 transition-colors",
                        fieldErrors.password ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-border/60 focus-visible:ring-primary"
                      )}
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
                  {fieldErrors.password && (
                    <p id="password-error" role="alert" className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none">
                      <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                {authError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="w-full flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500 animate-in fade-in-0 duration-200"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting || googleLoading}
                  className="w-full rounded-xl h-11 font-semibold shadow-md transition-all hover:shadow-primary/20"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : mode === "signin" ? (
                    "Sign In with Email"
                  ) : (
                    "Create Account with Email"
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
