import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/provider/theme-provider";
import { QueryProvider } from "@/provider/query-provider";
import { SessionProvider } from "@/provider/session-provider";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { siteUrl } from "@/lib/site-url";

/**
 * Only the weights the design actually uses.
 *
 * `next/font` emits a `<link rel="preload">` for every weight declared here,
 * so an unused one is not free: it is fetched at highest priority on the first
 * paint of every page, competing with the LCP image. Thin, ExtraLight, Light
 * and ExtraBold matched zero rules anywhere in `src` and cost 192 KB a visit
 * between them.
 *
 * Black (900) is reachable from exactly one place — the decorative watermark in
 * `story-section` — and is kept for it. Dropping that usage to `font-bold`
 * would save another 47 KB on every page.
 *
 * Before adding a weight back, check something reaches it:
 * `grep -r "font-light" src`.
 */
const vazirmatn = localFont({
  src: [
    {
      path: "../assets/fonts/Vazirmatn-FD-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  // Without this, every relative Open Graph and canonical URL resolves against
  // localhost in production — which is how share cards break silently.
  metadataBase: new URL(siteUrl),
  title: "کومه - خرید و فروش املاک قم",
  description:
    "املاک قم؛ خرید، فروش و اجاره انواع ملک در قم با پوشش کامل مناطق پردیسان، سالاریه، زنبیل‌آباد، صفاشهر، شهرک قدس، جمهوری، کریمی و فردوسی.",
  // `app/manifest.ts` is served at this path; naming it here is what puts the
  // <link rel="manifest"> in the document, and without that nothing installs.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    // iOS ignores the manifest's `display`, so standalone mode on iPhone comes
    // from this alone. `title` is what appears under the home-screen icon.
    capable: true,
    title: "کومه",
    // The header is brand navy and sits under the status bar, so the status
    // text has to be light. `default` would render it dark on dark.
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

/**
 * Painted behind the status bar on Android and around the page on desktop.
 * Split by scheme so the installed app does not show a navy bar in light mode
 * and a light one in dark.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#001b51" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={cn(vazirmatn.variable, "h-full antialiased")}
    >
      <DirectionProvider direction="rtl">
        <body className="min-h-full flex flex-col">
          <QueryProvider>
            <SessionProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <SiteHeader />
                  <main className="flex flex-1 flex-col">{children}</main>
                  <SiteFooter />
                  <MobileBottomNav />
                  <Toaster position="top-center" richColors />
                  <JsonLd data={organizationSchema()} />
                  <JsonLd data={websiteSchema()} />
                </TooltipProvider>
              </ThemeProvider>
            </SessionProvider>
          </QueryProvider>
        </body>
      </DirectionProvider>
    </html>
  );
}
