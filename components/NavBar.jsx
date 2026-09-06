"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import UserButton from "./UserButton";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2, Clock, ShieldCheck, Menu, X, ChevronRight, Home, Layers } from "lucide-react";
import { DM_Sans } from "next/font/google";

const dm_sans = DM_Sans({ weight: ["400", "500", "700"], subsets: ["latin"] });

const NavBar = () => {
  const { data: session, isPending } = authClient.useSession();

  const [formattedTimeDisplay, setFormattedTimeDisplay] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminPermissions, setHasAdminPermissions] = useState(false);
  const [navigationRouteList, setNavigationRouteList] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFormattedTimeDisplay(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 1000);
    setFormattedTimeDisplay(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setIsAuthenticated(true);
      setHasAdminPermissions(session.user.role === "admin");
    } else {
      setIsAuthenticated(false);
      setHasAdminPermissions(false);
    }
  }, [session]);

  useEffect(() => {
    const baseItems = [
      { label: "Departments", href: "/departments", icon: Layers },
    ];
    if (isAuthenticated && hasAdminPermissions) {
      baseItems.push({ label: "Admin Panel", href: "/admin", icon: ShieldCheck });
    }
    setNavigationRouteList(baseItems);
  }, [isAuthenticated, hasAdminPermissions]);

  // Close drawer on route navigation or escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[1px] shadow-md shadow-blue-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-background">
              <Image src="/assets/gdg.svg" alt="GDG Logo" width={24} height={24} className="transition-transform group-hover:rotate-12" priority />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`text-base font-bold tracking-tight text-foreground ${dm_sans.className}`}>
                GDG Recruitment
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              VIT Chapter · 2026
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/40">
          <Link
            href="/"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-background/80"
          >
            Home
          </Link>
          {navigationRouteList.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-background/80"
            >
              {item.icon && <item.icon className="h-3.5 w-3.5" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {formattedTimeDisplay && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-mono text-[11px]">{formattedTimeDisplay}</span>
            </div>
          )}

          <ThemeToggle />

          {isPending ? (
            <div className="flex h-9 w-9 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : !isAuthenticated ? (
            <Link href="/auth/signin" className="hidden sm:inline-block">
              <Button size="sm" className="rounded-full font-medium shadow-sm transition-all hover:shadow-primary/20">
                Sign In
              </Button>
            </Link>
          ) : (
            <UserButton user={session?.user} />
          )}

          {/* Mobile Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label={mobileDrawerOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileDrawerOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-foreground transition-colors hover:bg-muted/60 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Home className="h-4 w-4 text-primary" />
                <span>Home</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            {navigationRouteList.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon && <item.icon className="h-4 w-4 text-primary" />}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="pt-2 border-t border-border/40 mt-1">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full flex items-center justify-center"
                >
                  <Button className="w-full rounded-xl font-semibold shadow-md">
                    Sign In to Portal
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
