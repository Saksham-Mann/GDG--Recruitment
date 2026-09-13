"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers, Users, Rocket, Compass } from "lucide-react";
import { Button } from "./ui/button";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import Ripple from "@/components/magicui/ripple";
import ShineBorder from "@/components/magicui/shine-border";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function Hero() {
  const [headline] = useState("Recruitment 2026");
  const [subheading] = useState("Ready to make your mark?");
  const [descriptionText] = useState(
    "Join Google Developer Groups and collaborate on high-impact projects. Gain hands-on experience across technical, creative, and management domains."
  );

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 transform-gpu blur-3xl opacity-20 sm:opacity-30">
        <div className="h-full w-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 [clip-path:polygon(74.1%_44.1%,100%_61.6%,97.5%_26.9%,85.5%_0.1%,80.7%_2%,72.5%_32.5%,60.2%_62.4%,52.4%_68.1%,47.5%_58.3%,45.2%_34.5%,27.5%_76.7%,0.1%_64.9%,17.9%_100%,27.6%_76.8%,76.1%_97.7%,74.1%_44.1%)]" />
      </div>

      {/* Ambient Ripple Waves */}
      <Ripple
        mainCircleSize={220}
        numCircles={6}
        className="opacity-30 dark:opacity-25 [mask-image:radial-gradient(circle_at_center,white_30%,transparent_75%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none">
        {/* Live Status Badge with ShineBorder */}
        <div className="mb-6 inline-flex justify-center">
          <ShineBorder
            borderRadius={9999}
            borderWidth={1.5}
            duration={8}
            color={["#4285F4", "#EA4335", "#FBBC05", "#34A853"]}
            className="shadow-sm transition-transform hover:scale-105"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-background/90 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{headline} is Live · Applications Open</span>
            </div>
          </ShineBorder>
        </div>

        {/* Hero Headline */}
        <h1 className={`text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight sm:leading-[1.15] ${spaceGrotesk.className}`}>
          <span className="block text-foreground">{subheading}</span>
          <span className="mt-2 block bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-3">
            Build with Google Developer Groups
          </span>
        </h1>

        {/* Description Text */}
        <p className="mx-auto mt-8 sm:mt-10 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {descriptionText}
        </p>

        {/* Call to Actions (Explore on Left, Apply Now on Right) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/explore-departments" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 rounded-full px-8 font-semibold border-border/80 bg-background/80 hover:bg-muted/80 transition-all hover:scale-105 shadow-xs"
            >
              <Compass className="mr-2 h-4 w-4 text-primary" />
              <span>Explore Departments</span>
            </Button>
          </Link>

          <Link href="/departments" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 rounded-full px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30"
            >
              <span>Apply Now</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Feature Pill Highlights with Three Distinctly Different Icon Accent Colors */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          {/* Card 1: Diverse Domains - Google Blue */}
          <div style={{ animationDelay: "40ms" }} className="rounded-2xl border border-border/60 bg-card/75 backdrop-blur-sm p-6 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white border border-white/20 shadow-md shadow-blue-500/30 mb-4">
              <Layers className="h-5 w-5 stroke-[2.2] text-white" style={{ color: "#ffffff", opacity: 1 }} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Diverse Domains</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
              From Web, App, AI/ML to UI/UX Design, Outreach, and Event Management.
            </p>
          </div>

          {/* Card 2: Real-World Projects - Google Amber / Yellow */}
          <div style={{ animationDelay: "80ms" }} className="rounded-2xl border border-border/60 bg-card/75 backdrop-blur-sm p-6 shadow-xs transition-all hover:border-amber-500/40 hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white border border-white/20 shadow-md shadow-amber-500/30 mb-4">
              <Rocket className="h-5 w-5 stroke-[2.2] text-white" style={{ color: "#ffffff", opacity: 1 }} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Real-World Projects</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
              Contribute to real applications, open-source repos, and campus initiatives.
            </p>
          </div>

          {/* Card 3: Community & Mentorship - Google Green */}
          <div style={{ animationDelay: "120ms" }} className="rounded-2xl border border-border/60 bg-card/75 backdrop-blur-sm p-6 shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white border border-white/20 shadow-md shadow-emerald-500/30 mb-4">
              <Users className="h-5 w-5 stroke-[2.2] text-white" style={{ color: "#ffffff", opacity: 1 }} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Community & Mentorship</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-normal">
              Learn alongside talented peers, senior leads, and industry mentors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
