// Font
import { Inter } from "next/font/google";
// Providers
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SubmissionsProvider } from "@/components/SubmissionsProvider";
import ScrollTopProgress from "@/components/ScrollTopProgress";
import CookieConsent from "@/components/CookieConsent";
// Styling
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  title: {
    default: "GDG Recruitment Portal 2026 | Google Developer Groups",
    template: "%s | GDG Recruitment",
  },
  description:
    "Official recruitment portal for Google Developer Groups VIT chapter. Explore technical, design, management, and outreach tracks and submit your application.",
  keywords: [
    "Google Developer Groups",
    "GDG",
    "GDG VIT",
    "Recruitment",
    "Student Developers",
    "Web Dev",
    "App Dev",
    "UI/UX",
  ],
  authors: [{ name: "GDG Tech Team" }],
  creator: "Google Developer Groups",
  publisher: "Google Developer Groups",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GDG Recruitment Portal",
    title: "GDG Recruitment Portal 2026",
    description:
      "Join the Google Developer Groups chapter. Apply for Technical, Design, Management, and Outreach tracks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDG Recruitment Portal 2026",
    description:
      "Join the Google Developer Groups chapter. Apply for Technical, Design, Management, and Outreach tracks.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* Skip to Content Accessibility Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[70] rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Skip to main content
        </a>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SubmissionsProvider>
            <ScrollTopProgress />
            {children}
            <CookieConsent />
            <Toaster richColors position="top-right" />
          </SubmissionsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
