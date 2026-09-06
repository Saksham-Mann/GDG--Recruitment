import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import DeptHero from "@/components/DeptHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Smartphone, Globe, Code2 } from "lucide-react";

const features = [
  {
    name: "App Dev",
    icon: Smartphone,
    color: "#6EE7A0",
    description:
      "Builds intuitive, impactful mobile applications, improving accessibility, interaction, and convenience for members and event participants through functional, user-focused design.",
    href: "/join/339f0f8a-72f2-44b9-92ab-2b0d4dcfa0f6",
    cta: "Apply to App Dev",
  },
  {
    name: "Web Dev",
    icon: Globe,
    color: "#8AB4F8",
    description:
      "Designs, develops, and maintains responsive, high-performance websites for projects and events, using modern web technologies to enhance accessibility, user experience, and community engagement online.",
    href: "/join/8143de1d-db17-42fa-958d-13b10804f894",
    cta: "Apply to Web Dev",
  },
];

const DevelopmentPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <DeptHero
            dept={{
              name: "Software & Application Development",
              body: "Explore engineering tracks shaping the future of web and mobile software at GDG.",
            }}
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const IconComp = feature.icon;
              return (
                <Card
                  key={feature.name}
                  className="flex flex-col justify-between border-border/60 bg-card/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-lg rounded-2xl p-2"
                >
                  <CardHeader>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                      {feature.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed pt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-4">
                    <Link href={feature.href} className="w-full">
                      <Button className="w-full rounded-full font-medium shadow-sm transition-all hover:shadow-primary/20">
                        <span>{feature.cta}</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DevelopmentPage;
