"use client";

import React, { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DeptHero = ({ dept, setPhotoQs, photoQs, isLoading, setIsLoading }) => {
  useEffect(() => {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return (
    <section className="py-8 text-center max-w-4xl mx-auto px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        {!photoQs ? dept?.name || "Departments" : "Video Editing"}
      </h1>
      {dept?.body && (
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">
          {dept.body}
        </p>
      )}
      {dept?.name === "Photography" && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Switch
            id="photo-toggle"
            checked={photoQs}
            onCheckedChange={setPhotoQs}
          />
          <Label htmlFor="photo-toggle" className="text-sm font-medium cursor-pointer">
            Switch to Video Editing
          </Label>
        </div>
      )}
    </section>
  );
};

export default DeptHero;
