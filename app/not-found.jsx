import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StatusErrorLayout from "@/components/StatusErrorLayout";

export const metadata = {
  title: "Page Not Found · GDG Recruitment",
  description: "The requested recruitment page or resource could not be found.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1 flex items-center justify-center py-12">
        <StatusErrorLayout
          code={404}
          title="Page Not Found"
          message="The department, application track, or recruitment page you requested does not exist or has been moved."
          showSearch={true}
        />
      </main>
      <Footer />
    </div>
  );
}
