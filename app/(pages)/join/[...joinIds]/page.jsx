"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { reviews } from "@/constants/index";
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import FormSkeleton from "@/components/skeletons/FormSkeleton";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight, Mail } from "lucide-react";

const JoinDepartmentPage = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentParamIds, setDepartmentParamIds] = useState([]);
  const [resolvedDepartment1, setResolvedDepartment1] = useState(null);
  const [resolvedDepartment2, setResolvedDepartment2] = useState(null);

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (params?.joinIds) {
      setDepartmentParamIds([...params.joinIds]);
    }
  }, [params]);

  useEffect(() => {
    if (departmentParamIds.length > 0) {
      const d1 = reviews.find((d) => d.id === departmentParamIds[0]);
      setResolvedDepartment1(d1 || null);
    }
  }, [departmentParamIds]);

  useEffect(() => {
    if (departmentParamIds.length > 1) {
      const d2 = reviews.find((d) => d.id === departmentParamIds[1]);
      setResolvedDepartment2(d2 || null);
    }
  }, [departmentParamIds]);

  const user = session?.user;
  const isSignedIn = !!user;
  const isEmailVerified = user?.emailVerified !== false;

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

  const ids = Array.isArray(params?.joinIds) ? params.joinIds : [];
  const valid =
    ids.length >= 1 &&
    ids.length <= 2 &&
    ids.every((id) => reviews.some((dept) => dept.id === id));

  if (!valid) {
    notFound();
  }

  const departments = reviews.filter((dept) => ids.includes(dept.id));

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
