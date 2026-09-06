import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <Card className="max-w-md w-full rounded-2xl border-border/60 bg-card/80 backdrop-blur-md shadow-xl text-center p-4">
          <CardHeader className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Department Not Found
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sorry, the department you are looking for does not exist or may have been updated.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/departments" className="w-full sm:w-auto">
              <Button className="w-full rounded-full font-medium shadow-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Browse Domains</span>
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full font-medium">
                <Home className="mr-2 h-4 w-4" />
                <span>Go Home</span>
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 