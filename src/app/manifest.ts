import type { MetadataRoute } from "next";

import { routes } from "@/lib/routes";

/**
 * The web app manifest.
 *
 * Every URL here is root-relative on purpose. The app is on a Vercel preview
 * domain today and moves to the real one later, and an absolute `start_url`
 * would point installed copies at the old host after the move — a manifest is
 * read once at install time, so that mistake outlives the deploy that made it.
 *
 * `theme_color` is the brand navy (`--brand`, oklch(0.245 0.105 260.802)) and
 * `background_color` the light-theme page background, which is what the splash
 * screen paints before the first frame renders.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "کومه — خرید، فروش و اجاره ملک در قم",
    short_name: "کومه",
    description:
      "املاک قم؛ خرید، فروش و اجاره انواع ملک با پوشش کامل مناطق شهر، فایل‌های بررسی‌شده و مشاوران محلی.",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#001b51",
    background_color: "#ffffff",
    categories: ["business", "lifestyle", "shopping"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Android crops adaptive icons to a circle or squircle. Without a
      // `maskable` entry it crops the "any" icon instead, which cuts into the
      // mark; this one carries the same art inset into the 80% safe zone.
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "جستجوی ملک",
        short_name: "جستجو",
        url: routes.properties(),
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "ثبت ملک",
        short_name: "ثبت ملک",
        url: routes.panel.newProperty,
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "پنل کاربری",
        short_name: "پنل",
        url: routes.panel.dashboard,
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
