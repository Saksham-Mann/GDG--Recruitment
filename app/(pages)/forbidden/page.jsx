import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StatusErrorLayout from "@/components/StatusErrorLayout";

export const metadata = {
  title: "Access Restricted · GDG Recruitment",
  description: "Administrator permissions are required to access this portal resource.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1 flex items-center justify-center py-12">
        <StatusErrorLayout
          code={403}
          title="Administrative Access Required"
          message="Your current student account does not have administrator privileges to view candidate submissions or manage shortlist allocations. You can switch to an authorized staff account or return to candidate portal."
        />
      </main>
      <Footer />
    </div>
  );
}
