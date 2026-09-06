"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import { LINKS } from "@/constants";
import { FaInstagram, FaDiscord, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

const dm_sans = DM_Sans({ weight: ["400", "500", "700"], subsets: ["latin"] });

const Footer = () => {
  const [currentYearString, setCurrentYearString] = useState("2026");

  useEffect(() => {
    setCurrentYearString(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Image src="/assets/gdg.svg" alt="GDG Logo" width={20} height={20} />
              </div>
              <span className={`text-base font-bold tracking-tight text-foreground ${dm_sans.className}`}>
                Google Developer Groups
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-left max-w-xs">
              Empowering students and creators to build real-world solutions and grow together.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex justify-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/explore-departments" className="transition-colors hover:text-foreground">
              Explore
            </Link>
            <Link href="/departments" className="transition-colors hover:text-foreground">
              Apply
            </Link>
          </div>

          {/* Column 3: Social Links */}
          <div className="flex justify-center md:justify-end gap-3 text-muted-foreground">
            {LINKS?.instagram && (
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background transition-all hover:border-primary/40 hover:text-foreground hover:scale-110"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
            )}
            {LINKS?.discord && (
              <a
                href={LINKS.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background transition-all hover:border-primary/40 hover:text-foreground hover:scale-110"
              >
                <FaDiscord className="h-4 w-4" />
              </a>
            )}
            {LINKS?.linkedin && (
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background transition-all hover:border-primary/40 hover:text-foreground hover:scale-110"
              >
                <FaLinkedin className="h-4 w-4" />
              </a>
            )}
            {LINKS?.x && (
              <a
                href={LINKS.x}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background transition-all hover:border-primary/40 hover:text-foreground hover:scale-110"
              >
                <FaXTwitter className="h-4 w-4" />
              </a>
            )}
            {LINKS?.gmail && (
              <a
                href={LINKS.gmail}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background transition-all hover:border-primary/40 hover:text-foreground hover:scale-110"
              >
                <SiGmail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYearString} Google Developer Groups. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              User Agreement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
