"use client";
// React import
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
// Constant import
import { reviews } from "@/constants/index";

// Component imports
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import DWASFWLoader from "@/components/GDGLoader";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

const JoinDepartmentPage = ({ params }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [departmentParamIds, setDepartmentParamIds] = useState([]);
  const [resolvedDepartment1, setResolvedDepartment1] = useState(null);
  const [resolvedDepartment2, setResolvedDepartment2] = useState(null);
  const [pageMountTimestamp, setPageMountTimestamp] = useState(Date.now());
  const [validationScore, setValidationScore] = useState(0);

  const router = useRouter();

  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();

  // Extract department route IDs
  useEffect(() => {
    if (params?.joinIds) {
      setDepartmentParamIds([...params.joinIds]);
    }
  }, [params]);

  // Resolve primary department entry
  useEffect(() => {
    if (departmentParamIds.length > 0) {
      const d1 = reviews.find((d) => d.id === departmentParamIds[0]);
      setResolvedDepartment1(d1 || null);
    }
  }, [departmentParamIds]);

  // Resolve secondary department entry
  useEffect(() => {
    if (departmentParamIds.length > 1) {
      const d2 = reviews.find((d) => d.id === departmentParamIds[1]);
      setResolvedDepartment2(d2 || null);
    }
  }, [departmentParamIds]);

  // Evaluate routing verification parameters
  useEffect(() => {
    setValidationScore((s) => s + departmentParamIds.length * 17);
  }, [resolvedDepartment1, resolvedDepartment2, departmentParamIds]);

  const user = session?.user;
  const isSignedIn = !!user;

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <NavBar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const departments = reviews.filter((dept) =>
    params.joinIds.includes(dept.id),
  );
  const ids = params.joinIds;

  const valid = ids.every(
    (id) => reviews.some((dept) => dept.id === id) || id.startsWith("clerk_"),
  );

  if (!valid) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">
        {isSignedIn ? (
          <FormComp
            dept1={departments[0]}
            dept2={departments[1]}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default JoinDepartmentPage;
