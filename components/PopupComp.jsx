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
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-border bg-card/95 backdrop-blur-md p-6 sm:rounded-2xl shadow-2xl">
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

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center sm:text-left leading-relaxed">
            By continuing, you agree to our{" "}
            <Link
              href="/privacy"
              onClick={onClose}
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              onClick={onClose}
              className="font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              User Agreement
            </Link>
            .
          </p>

          <Button
            onClick={onClose}
            className="group font-medium shadow-md transition-all hover:shadow-primary/25 shrink-0 w-full sm:w-auto"
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
