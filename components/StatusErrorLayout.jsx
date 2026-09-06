"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Lock,
  ShieldAlert,
  SearchX,
  ServerCrash,
  Home,
  RefreshCw,
  LogOut,
  ArrowRight,
  Search,
  ChevronRight,
} from "lucide-react";
import { reviews } from "@/constants/index";
import { authClient } from "@/lib/auth-client";

export default function StatusErrorLayout({
  code = 404,
  title,
  message,
  action,
  showSearch = false,
  returnUrl = "/",
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDepts = searchQuery.trim()
    ? reviews.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ).slice(0, 4)
    : reviews.slice(0, 4);

  const handleSignOutAndSwitch = async () => {
    try {
      await authClient.signOut();
      router.push("/auth/signin");
    } catch {
      router.push("/auth/signin");
    }
  };

  const getStatusDetails = () => {
    switch (code) {
      case 401:
        return {
          icon: Lock,
          iconBg: "bg-blue-500/10 text-blue-500",
          defaultTitle: "Authentication Required",
          defaultMessage:
            "You need to sign in with your student credentials to access this section of the recruitment portal.",
          badge: "401 · Unauthorized",
        };
      case 403:
        return {
          icon: ShieldAlert,
          iconBg: "bg-amber-500/10 text-amber-500",
          defaultTitle: "Access Restricted",
          defaultMessage:
            "Your account does not possess administrator privileges to access this resource. If you believe this is in error, please sign in with an authorized account.",
          badge: "403 · Forbidden",
        };
      case 500:
      case 503:
        return {
          icon: ServerCrash,
          iconBg: "bg-rose-500/10 text-rose-500",
          defaultTitle: "Service Interruption",
          defaultMessage:
            "An unexpected error occurred while processing your request. Your existing drafted applications and submitted data remain safe.",
          badge: `${code} · Internal Error`,
        };
      case 404:
      default:
        return {
          icon: SearchX,
          iconBg: "bg-purple-500/10 text-purple-500",
          defaultTitle: "Page Not Found",
          defaultMessage:
            "The recruitment resource, department page, or URL you requested does not exist or has been relocated.",
          badge: "404 · Not Found",
        };
    }
  };

  const { icon: Icon, iconBg, defaultTitle, defaultMessage, badge } = getStatusDetails();

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="max-w-xl w-full rounded-2xl border-border/60 bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2 pt-8 space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner mb-1 transition-transform hover:scale-105"
               style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-muted/60 text-muted-foreground border border-border/40 mx-auto">
            {badge}
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title || defaultTitle}
          </CardTitle>

          <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {message || defaultMessage}
          </CardDescription>
        </CardHeader>

        {showSearch && (
          <CardContent className="space-y-4 pt-4 px-6 sm:px-8">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search recruitment tracks (e.g. Web Dev, Design)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground block px-1">
                Explore Active Departments:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredDepts.map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/join/${dept.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors group"
                  >
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {dept.name}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        )}

        <CardFooter className="pt-6 pb-8 px-6 sm:px-8 flex flex-col sm:flex-row gap-3 justify-center border-t border-border/40 bg-muted/10">
          {code === 401 && (
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl font-medium shadow-md shadow-primary/20"
            >
              <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(returnUrl)}`}>
                <span>Sign In to Continue</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          {code === 403 && (
            <Button
              onClick={handleSignOutAndSwitch}
              variant="outline"
              className="w-full sm:w-auto rounded-xl font-medium border-border/60"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Switch Account
            </Button>
          )}

          {(code === 500 || code === 503) && action && (
            <Button
              onClick={action}
              className="w-full sm:w-auto rounded-xl font-medium shadow-md"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Request
            </Button>
          )}

          <Button
            asChild
            variant={code === 401 ? "outline" : "default"}
            className="w-full sm:w-auto rounded-xl font-medium shadow-sm"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
