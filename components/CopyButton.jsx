"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({
  text,
  label = "Copy",
  className = "",
  variant = "ghost",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        copied
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/40"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
