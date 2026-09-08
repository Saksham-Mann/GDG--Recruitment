"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import {
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
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
  const queryEmail = searchParams.get("email") || "";

  const initialMode =
    queryMode === "verify"
      ? "verify"
      : queryMode === "signup" || queryTab === "signup"
      ? "signup"
      : "signin";

  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState(initialMode); // "signin" | "signup" | "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [authError, setAuthError] = useState("");

  // OTP Verification state
  const [pendingEmail, setPendingEmail] = useState(queryEmail);
  const [pendingPassword, setPendingPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds cooldown
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Sync mode if URL query parameter changes
  useEffect(() => {
    if (queryMode === "verify") {
      setMode("verify");
      if (queryEmail) setPendingEmail(queryEmail);
    } else if (queryMode === "signup" || queryTab === "signup") {
      setMode("signup");
    } else if (queryMode === "signin" || queryTab === "signin") {
      setMode("signin");
    }
    setFieldErrors({});
    setAuthError("");
    setGoogleLoading(false);
  }, [queryMode, queryTab, queryEmail]);

  // Handle OAuth or callback error parameters in URL
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");
    if (errorParam) {
      if (errorParam === "account_not_linked") {
        setAuthError(
          "An account with this email already exists. Please verify your credentials or sign in with your email and password."
        );
      } else {
        setAuthError(
          errorDesc || `Authentication error: ${errorParam.replace(/_/g, " ")}`
        );
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user && !isPending && mode !== "verify") {
      router.push("/");
    }
  }, [session, isPending, mode, router]);

  // Countdown timers for OTP expiration and resend cooldown
  useEffect(() => {
    if (mode !== "verify") return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      const normalizedEmail = email.trim().toLowerCase();
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email: normalizedEmail,
          password,
          name: name.trim(),
        });

        if (res?.error) {
          setAuthError(
            res.error.message ||
              "An account with this email may already exist. Please sign in instead."
          );
        } else {
          // Manual signup successful - user is unverified and session is not established.
          // Send OTP and transition to in-app verification screen.
          setPendingEmail(normalizedEmail);
          setPendingPassword(password);
          setMode("verify");
          setCountdown(600);
          setResendCooldown(60);
          setAttemptsRemaining(3);
          setOtpCode("");
          setOtpError("");
          toast.success("Verification code dispatched to your email address.");

          // Proactively ensure OTP record is generated
          try {
            await fetch("/api/auth/otp/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: normalizedEmail }),
            });
          } catch {
            // Handled gracefully by server-side lifecycle
          }
        }
      } else {
        const res = await authClient.signIn.email({
          email: normalizedEmail,
          password,
          callbackURL: "/",
        });

        if (res?.error) {
          const errorMsg = res.error.message || "";
          const errorCode = res.error.code || "";

          if (
            errorCode === "EMAIL_NOT_VERIFIED" ||
            errorMsg.toLowerCase().includes("not verified")
          ) {
            // Unverified account trying to sign in: redirect to OTP verification
            setPendingEmail(normalizedEmail);
            setPendingPassword(password);
            setMode("verify");
            setCountdown(600);
            setResendCooldown(60);
            setAttemptsRemaining(3);
            setOtpCode("");
            setOtpError(
              "Your account email has not been verified yet. Enter the 6-digit code sent to your email."
            );

            // Send fresh OTP
            try {
              await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalizedEmail }),
              });
            } catch {
              // Graceful degradation
            }
          } else {
            setAuthError(
              "Authentication Failed: The email or password entered does not match existing records. Please verify your credentials or click 'Create Account'."
            );
          }
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError(
        "Connection Failed: Unable to reach authentication service. Please check your network connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setOtpError("Please enter a valid 6-digit numeric verification code.");
      return;
    }

    if (countdown === 0) {
      setOtpError("This verification code has expired. Please request a new code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingEmail,
          otp: cleanOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.remainingAttempts !== undefined) {
          setAttemptsRemaining(data.remainingAttempts);
        }
        setOtpError(data.error || "Verification failed. Please check the code entered.");
        setOtpLoading(false);
        return;
      }

      toast.success("Email verified successfully! Logging you in...");

      // Automatically complete login session if password was provided during signup/signin
      if (pendingPassword) {
        const loginRes = await authClient.signIn.email({
          email: pendingEmail,
          password: pendingPassword,
          callbackURL: "/",
        });

        if (!loginRes?.error) {
          router.push("/");
          return;
        }
      }

      // If no stored password, transition to standard sign-in
      setMode("signin");
      setEmail(pendingEmail);
      setPassword("");
      setAuthError("");
      toast.success("Account activated! Please sign in with your password.");
    } catch (err) {
      console.error("OTP verification network error:", err);
      setOtpError("Network error while validating verification code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Failed to resend verification code.");
      } else {
        toast.success("A fresh 6-digit verification code has been dispatched.");
        setResendCooldown(60);
        setCountdown(600);
        setAttemptsRemaining(3);
        setOtpCode("");
      }
    } catch (err) {
      console.error("OTP resend network error:", err);
      setOtpError("Network error while requesting a new verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setGoogleLoading(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: searchParams.get("callbackUrl") || "/",
        errorCallbackURL: "/auth/signin",
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

  if (session?.user && mode !== "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Redirecting to candidate portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="w-full max-w-md space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none">
          {mode === "verify" ? (
            /* ========================================================================= */
            /* IN-APP 6-DIGIT OTP ENTRY SCREEN */
            /* ========================================================================= */
            <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl rounded-2xl">
              <CardHeader className="space-y-2 text-center pb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-1">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className={`text-2xl font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-semibold text-foreground break-all">{pendingEmail}</span>. Enter the code below
                  to activate your account.
                </CardDescription>

                {/* Expiration and Security Badges */}
                <div className="flex items-center justify-center gap-2 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-muted-foreground border border-border/40">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      Expires in:{" "}
                      <span className={cn("font-mono font-semibold", countdown < 60 ? "text-red-500" : "text-foreground")}>
                        {formatTime(countdown)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-muted-foreground border border-border/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>
                      Attempts left:{" "}
                      <span className="font-semibold text-foreground">{attemptsRemaining}</span>
                    </span>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleVerifyOtp} noValidate>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="otp-input" className="text-xs font-medium text-foreground text-center block">
                      6-Digit Verification Code
                    </Label>
                    <div className="flex justify-center">
                      <Input
                        id="otp-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus
                        autoComplete="one-time-code"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtpCode(val);
                          setOtpError("");
                        }}
                        className="h-14 w-60 rounded-xl border border-border/80 bg-background/80 text-center font-mono text-2xl font-bold tracking-[0.5em] shadow-inner focus-visible:ring-primary"
                        aria-label="6-digit verification code"
                        aria-invalid={!!otpError}
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="w-full flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500 animate-in fade-in-0 duration-200"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* Resend OTP Bar */}
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border/30 text-xs">
                    <span className="text-muted-foreground">Did not receive the code?</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={resendCooldown > 0 || resendLoading}
                      onClick={handleResendOtp}
                      className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {resendLoading ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : resendCooldown > 0 ? (
                        <span>Resend in {resendCooldown}s</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Resend OTP</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={otpLoading || otpCode.length !== 6 || countdown === 0}
                    className="w-full rounded-xl h-11 font-semibold shadow-md transition-all hover:shadow-primary/20"
                  >
                    {otpLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Account...</span>
                      </div>
                    ) : (
                      "Verify & Activate Account"
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setOtpError("");
                      setAuthError("");
                    }}
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change Email Address</span>
                  </button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            /* ========================================================================= */
            /* CREDENTIAL SIGN-IN / SIGN-UP FORM */
            /* ========================================================================= */
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
                      <Label
                        htmlFor="name"
                        className={cn(
                          "text-xs font-medium transition-colors",
                          fieldErrors.name ? "text-red-500 font-semibold" : "text-foreground"
                        )}
                      >
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
                            fieldErrors.name
                              ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500"
                              : "border-border/60 focus-visible:ring-primary"
                          )}
                        />
                      </div>
                      {fieldErrors.name && (
                        <p
                          id="name-error"
                          role="alert"
                          className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
                        >
                          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className={cn(
                        "text-xs font-medium transition-colors",
                        fieldErrors.email ? "text-red-500 font-semibold" : "text-foreground"
                      )}
                    >
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
                          fieldErrors.email
                            ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500"
                            : "border-border/60 focus-visible:ring-primary"
                        )}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
                      >
                        <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      className={cn(
                        "text-xs font-medium transition-colors",
                        fieldErrors.password ? "text-red-500 font-semibold" : "text-foreground"
                      )}
                    >
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
                          fieldErrors.password
                            ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500"
                            : "border-border/60 focus-visible:ring-primary"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p
                        id="password-error"
                        role="alert"
                        className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1.5 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
                      >
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
          )}
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
