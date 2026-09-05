"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const DWASFWLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px] shadow-lg shadow-primary/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-background">
            <Image src="/assets/gdg.svg" alt="GDG" width={28} height={28} className="animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading portal...</span>
        </div>
      </div>
    </div>
  );
};

export default DWASFWLoader;
