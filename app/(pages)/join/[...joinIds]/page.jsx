"use client";

import React, { useState } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { reviews } from "@/constants/index";
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import FormSkeleton from "@/components/skeletons/FormSkeleton";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight, Mail } from "lucide-react";

export function findDepartment(identifier) {
  if (!identifier) return null;
  const raw = decodeURIComponent(String(identifier)).trim().toLowerCase();
  const stripped = raw.replace(/[^a-z0-9]/g, "");

  return (
    reviews.find((dept) => {
      if (dept.id.toLowerCase() === raw) return true;
      if (dept.name.toLowerCase() === raw) return true;
      const deptStripped = dept.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (deptStripped === stripped) return true;
      if (dept.name.toLowerCase().startsWith(raw) && raw.length >= 3) return true;
      return false;
    }) || null
  );
}

const JoinDepartmentPage = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const routeParams = useParams();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isSignedIn = !!user;
  const isEmailVerified = user?.emailVerified !== false;

  const rawIds = routeParams?.joinIds || params?.joinIds || [];
  const ids = Array.isArray(rawIds) ? rawIds : rawIds ? [rawIds] : [];
  const resolvedDepartments = ids.map(findDepartment).filter(Boolean);
  const valid =
    ids.length >= 1 &&
    ids.length <= 2 &&
    resolvedDepartments.length === ids.length;

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-200">
        <NavBar />
        <main className="flex-1">
          <FormSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!valid) {
    notFound();
  }

  const departments = resolvedDepartments;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        {!isSignedIn ? (
          <div className="flex items-center justify-center py-20 px-4">
            <Card className="max-w-md w-full rounded-2xl border-border/60 bg-card/80 backdrop-blur-md shadow-xl text-center p-4">
              <CardHeader className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Sign In Required
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Please sign in with your student account to access the department application form and track your progress.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4 flex justify-center">
                <Button
                  onClick={() => router.push("/auth/signin")}
                  size="lg"
                  className="rounded-full px-8 font-semibold shadow-md transition-all hover:shadow-primary/25"
                >
                  <span>Sign In to Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : !isEmailVerified ? (
          <div className="flex items-center justify-center py-20 px-4">
            <Card className="max-w-md w-full rounded-2xl border-border/60 bg-card/80 backdrop-blur-md shadow-xl text-center p-4">
              <CardHeader className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
                  <Mail className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Email Verification Required
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Your account email ({user.email}) must be verified with a 6-digit code before accessing the application form.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4 flex justify-center">
                <Button
                  onClick={() => router.push(`/auth/signin?mode=verify&email=${encodeURIComponent(user.email)}`)}
                  size="lg"
                  className="rounded-full px-8 font-semibold shadow-md transition-all hover:shadow-primary/25"
                >
                  <span>Verify Email Address</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <FormComp
            dept1={departments[0]}
            dept2={departments[1]}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default JoinDepartmentPage;
