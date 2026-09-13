"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";
import DotPattern from "@/components/magicui/dot-pattern";
import { reviews } from "@/constants/index";
import { Layers } from "lucide-react";

export const ReviewCard = ({ icon: IconComponent, tone, name, description, body }) => {
    const text = typeof description === "string" ? description : typeof body === "string" ? body : "";
    const formattedPreview = text ? text.slice(0, 75) : "";
    const toneColor = tone || "#3b82f6";
    const Icon = IconComponent || Layers;

    return (
        <figure
            className={cn(
                "relative w-72 cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-200",
                // light styles
                "border-border/70 bg-card/80 hover:bg-card hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5",
                // dark styles
                "dark:border-border/50 dark:bg-card/50 dark:hover:bg-card/90 dark:hover:border-primary/60 dark:hover:shadow-lg dark:hover:shadow-primary/10"
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 text-white shadow-xs transition-transform duration-200 group-hover:scale-105"
                    style={{
                        backgroundColor: toneColor,
                        boxShadow: `0 3px 12px ${toneColor}40`,
                    }}
                >
                    <Icon className="h-5 w-5 stroke-[2.2] text-white" style={{ color: "#ffffff", opacity: 1 }} />
                </div>
                <div className="flex flex-col min-w-0">
                    <figcaption className="text-sm font-semibold text-foreground truncate">
                        {name}
                    </figcaption>
                    <span className="text-[11px] font-medium text-muted-foreground">
                        GDG Domain
                    </span>
                </div>
            </div>
            <blockquote className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {formattedPreview}&hellip;
            </blockquote>
        </figure>
    );
};

const Departments = () => {
    const { primaryRowList, secondaryRowList } = React.useMemo(() => {
        const half = Math.ceil(reviews.length / 2);
        return {
            primaryRowList: reviews.slice(0, half),
            secondaryRowList: reviews.slice(half),
        };
    }, []);

    return (
        <div className="relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-none bg-background">
            {/* Ambient Dot Pattern Background */}
            <DotPattern
                width={20}
                height={20}
                cx={1}
                cy={1}
                cr={1}
                className={cn(
                    "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)] opacity-40 dark:opacity-30"
                )}
            />

            <Marquee pauseOnHover className="py-2">
                {primaryRowList.map((review) => (
                    <Link
                        key={`${review.id}-${review.name}`}
                        href={`/explore-departments?dept=${encodeURIComponent(review.name)}`}
                        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                    >
                        <ReviewCard {...review} />
                    </Link>
                ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="py-2">
                {secondaryRowList.map((review) => (
                    <Link
                        key={`${review.id}-${review.name}`}
                        href={`/explore-departments?dept=${encodeURIComponent(review.name)}`}
                        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                    >
                        <ReviewCard {...review} />
                    </Link>
                ))}
            </Marquee>

            {/* Side Fading Masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10" />
        </div>
    );
};

export default Departments;
