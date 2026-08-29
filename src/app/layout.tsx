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
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
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
 * Black (900) went the same way. Its only reader was the watermark in
 * `story-section`, set at 12rem and 5% opacity, where 700 and 900 are not
 * tellable apart — 47 KB off the critical path of every page for a difference
 * nobody can see.
 *
 * What is left is four weights and about 191 KB. Going lower means the
 * variable build of Vazirmatn, which covers 100-900 in a single file around
 * 140 KB; that needs a font this repo does not ship yet.
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
  /**
   * Share cards. Most of this site`s traffic is a listing link pasted into
   * Telegram or WhatsApp, so a link that unfurls with nothing is a link that
   * does not get opened.
   *
   * Set once here and inherited: a page that overrides `openGraph.title` keeps
   * this `siteName`, `locale` and image unless it names its own.
   */
  openGraph: {
    type: "website",
    siteName: "کومه",
    locale: "fa_IR",
    url: siteUrl,
    title: "کومه - خرید و فروش املاک قم",
    description:
      "املاک قم؛ خرید، فروش و اجاره انواع ملک در قم با پوشش کامل مناطق پردیسان، سالاریه، زنبیل‌آباد، صفاشهر، شهرک قدس، جمهوری، کریمی و فردوسی.",
    // The app icon, not a designed card: it is square, so it unfurls as a
    // thumbnail rather than a banner. Pages that have a real image of their
    // own — a listing, an article — override this and are the ones that
    // matter. A proper 1200x630 default needs artwork this repo does not have.
    images: [{ url: "/icon-512x512.png", width: 512, height: 512, alt: "کومه" }],
  },
  twitter: {
    // Telegram and WhatsApp read Open Graph, but X and several in-app browsers
    // look for these first.
    card: "summary_large_image",
    title: "کومه - خرید و فروش املاک قم",
    description:
      "املاک قم؛ خرید، فروش و اجاره انواع ملک در قم.",
    images: ["/icon-512x512.png"],
  },
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
                  <ServiceWorkerRegister />
                </TooltipProvider>
              </ThemeProvider>
            </SessionProvider>
          </QueryProvider>
        </body>
      </DirectionProvider>
    </html>
  );
}
