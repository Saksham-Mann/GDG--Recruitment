"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Info } from "lucide-react";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card/95 backdrop-blur-md p-6 sm:rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {PopupData?.header || "Notice"}
            </DialogTitle>
          </div>
          {PopupData?.description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {PopupData.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {PopupData?.message && (
          <div className="my-2 space-y-2 rounded-xl bg-muted/40 p-4 border border-border/40">
            {PopupData.message.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClose}
            className="group font-medium shadow-md transition-all hover:shadow-primary/25"
          >
            <span>Understood</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;
