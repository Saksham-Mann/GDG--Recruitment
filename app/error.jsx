"use client";

import React, { useEffect } from "react";
import StatusErrorLayout from "@/components/StatusErrorLayout";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log sanitized error indicator without exposing raw stack to end users
    console.error("Application runtime error encountered:", error?.message || "Unknown error");
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <StatusErrorLayout
        code={500}
        title="Application Exception"
        message="A runtime error interrupted the current page operation. Your application progress and drafted responses have been preserved safely. Click retry to recover your session."
        action={reset}
      />
    </div>
  );
}
