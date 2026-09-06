"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Check, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent_accepted");
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem("cookie_consent_accepted", "true");
    } catch {}
    setVisible(false);
  };

  const dismissCookies = () => {
    try {
      localStorage.setItem("cookie_consent_accepted", "essential");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300 print:hidden"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
          <Shield className="h-4 w-4" />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-foreground">Privacy & Essential Session Cookies</p>
          <p className="text-muted-foreground leading-relaxed">
            We use essential security cookies to authenticate your student session and protect your recruitment form submissions. We do not use third-party tracking cookies.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              onClick={acceptCookies}
              className="h-8 rounded-lg text-xs font-semibold px-3 shadow-sm"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={dismissCookies}
              className="h-8 rounded-lg text-xs font-medium px-3 border-border/60"
            >
              Essential Only
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
