import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/provider/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const vazirmatn = localFont({
  src: [
    {
      path: "../assets/fonts/Vazirmatn-FD-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/Vazirmatn-FD-Light.woff2",
      weight: "300",
      style: "normal",
    },
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
      path: "../assets/fonts/Vazirmatn-FD-ExtraBold.woff2",
      weight: "800",
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
  title: "کومه - خرید و فروش املاک قم",
  description:
    "املاک قم؛ خرید، فروش و اجاره انواع ملک در قم با پوشش کامل مناطق پردیسان، سالاریه، زنبیل‌آباد، صفاشهر، شهرک قدس، جمهوری، کریمی و فردوسی.",
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
      className={`${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <DirectionProvider direction="rtl">
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <SiteHeader />
              <main className="flex flex-1 flex-col">{children}</main>
              <SiteFooter />
              <MobileBottomNav />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </DirectionProvider>
    </html>
  );
}
