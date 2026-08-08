import type { StaticImageData } from "next/image";

import type { Gender } from "./avatars";
import blogCover from "@/assets/images/card/blog.webp";
import intro1 from "@/assets/images/intro/intro1.webp";
import intro2 from "@/assets/images/intro/intro2.webp";
import intro3 from "@/assets/images/intro/intro3.webp";
import intro4 from "@/assets/images/intro/intro4.webp";

export type BlogCategory =
  | "guide"
  | "market"
  | "legal"
  | "lifestyle"
  | "news";

export interface BlogCategoryMeta {
  key: BlogCategory;
  label: string;
  /** Tint pair kept on-palette (brand / secondary / muted variations). */
  chip: string;
}

/** The rich content model — rendered as styled blocks, not raw HTML. */
export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title: string; text: string };

export interface BlogAuthor {
  name: string;
  gender: Gender;
  role: string;
}

export interface BlogPost {
  /** Slug — also the route param. */
  id: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readMinutes: number;
  publishedDaysAgo: number;
  views: number;
  author: BlogAuthor;
  tags: string[];
  content: BlogBlock[];
  isFeatured?: boolean;
}

export const categoryMeta: Record<BlogCategory, BlogCategoryMeta> = {
  guide: {
    key: "guide",
    label: "راهنمای خرید",
    chip: "bg-brand/10 text-brand",
  },
  market: {
    key: "market",
    label: "تحلیل بازار",
    chip: "bg-secondary/15 text-secondary-foreground dark:text-secondary",
  },
  legal: {
    key: "legal",
    label: "حقوقی",
    chip: "bg-primary/10 text-brand dark:bg-white/10",
  },
  lifestyle: {
    key: "lifestyle",
    label: "سبک زندگی",
    chip: "bg-muted text-foreground",
  },
  news: {
    key: "news",
    label: "اخبار بازار",
    chip: "bg-destructive/10 text-destructive",
  },
};

export const categoryOrder: BlogCategory[] = [
  "guide",
  "market",
  "legal",
  "lifestyle",
  "news",
];

const authors: Record<string, BlogAuthor> = {
  ali: { name: "علی محمدی", gender: "male", role: "کارشناس ارشد املاک" },
  zahra: { name: "زهرا احمدی", gender: "female", role: "تحلیل‌گر بازار مسکن" },
  hossein: { name: "حسین رضایی", gender: "male", role: "مشاور حقوقی" },
  maryam: { name: "مریم کریمی", gender: "female", role: "کارشناس محتوا" },
};

/**
 * Cover art per post. Until real editorial images arrive, a small pool of the
 * bundled photos is assigned by index so cards don't all look identical.
 */
const coverPool: StaticImageData[] = [blogCover, intro1, intro2, intro3, intro4];

export function coverFor(post: BlogPost): StaticImageData {
  const seed = post.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return coverPool[seed % coverPool.length];
}

/** Shared closing block reused across posts, so each ends with a clear CTA. */
const closingCallout: BlogBlock = {
  type: "callout",
  title: "به مشاوره نیاز دارید؟",
  text: "کارشناسان گروه املاک کومه آماده‌اند شما را در خرید، فروش یا اجاره ملک در قم همراهی کنند. کافی است با نزدیک‌ترین شعبه تماس بگیرید.",
};

export const blogPosts: BlogPost[] = [
  {
    id: "a1",
    title: "راهنمای خرید آپارتمان در قم؛ نکاتی که نباید نادیده بگیرید",
    excerpt:
      "پیش از امضای قرارداد، این چک‌لیست را مرور کنید تا از یک خرید مطمئن اطمینان حاصل کنید.",
    category: "guide",
    readMinutes: 6,
    publishedDaysAgo: 3,
    views: 4210,
    author: authors.ali,
    tags: ["خرید آپارتمان", "قم", "چک‌لیست معامله", "سند رسمی"],
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        text: "خرید آپارتمان یکی از مهم‌ترین تصمیم‌های مالی هر خانواده است. در قم به‌دلیل تنوع محله‌ها و بازه گسترده قیمت، شناخت درست ملک و بررسی دقیق مدارک اهمیت دوچندانی پیدا می‌کند. در این راهنما مهم‌ترین نکاتی را مرور می‌کنیم که پیش از امضای قرارداد باید بررسی کنید.",
      },
      { type: "heading", text: "۱. موقعیت و دسترسی محله" },
      {
        type: "paragraph",
        text: "پیش از هر چیز، موقعیت ملک را نسبت به مراکز مهم زندگی روزمره بسنجید. نزدیکی به مدرسه، درمانگاه، ایستگاه حمل‌ونقل عمومی و مراکز خرید، هم کیفیت زندگی و هم ارزش‌گذاری آینده ملک را تعیین می‌کند.",
      },
      { type: "heading", text: "۲. بررسی وضعیت سند" },
      {
        type: "paragraph",
        text: "سند تک‌برگ رسمی مطمئن‌ترین حالت مالکیت است. اگر ملک قولنامه‌ای یا وکالتی است، حتماً پیش از پرداخت هرگونه مبلغ، وضعیت حقوقی آن را با یک کارشناس بررسی کنید.",
      },
      {
        type: "list",
        items: [
          "تطبیق مشخصات سند با شناسنامه فروشنده",
          "استعلام عدم بازداشت ملک از دفترخانه",
          "بررسی بدهی شارژ، آب، برق و گاز",
          "کنترل پایان‌کار و صورت‌مجلس تفکیکی",
        ],
      },
      { type: "heading", text: "۳. کیفیت ساخت و عمر بنا" },
      {
        type: "paragraph",
        text: "سن بنا، مصالح به‌کاررفته، وضعیت لوله‌کشی و سیم‌کشی و کیفیت نازک‌کاری را از نزدیک بررسی کنید. یک بازدید دقیق در ساعات مختلف روز، نور و سروصدای واقعی واحد را نشان می‌دهد.",
      },
      {
        type: "quote",
        text: "بهترین معامله، معامله‌ای است که پس از آن آرامش خیال داشته باشید؛ نه ارزان‌ترین قیمت.",
        cite: "علی محمدی، کارشناس ارشد املاک",
      },
      { type: "heading", text: "۴. تنظیم قرارداد شفاف" },
      {
        type: "paragraph",
        text: "تمام توافق‌ها، از مبلغ و زمان‌بندی پرداخت تا تاریخ تحویل و تعهدات طرفین، باید به‌صورت مکتوب و روشن در قرارداد بیاید. بررسی قرارداد توسط وکیل، از بروز اختلاف‌های آینده جلوگیری می‌کند.",
      },
      closingCallout,
    ],
  },
  {
    id: "a2",
    title: "روند قیمت مسکن در قم در فصل جاری",
    excerpt:
      "تحلیلی کوتاه از نوسانات قیمت در مناطق پرتقاضای شهر و پیش‌بینی ماه‌های آینده.",
    category: "market",
    readMinutes: 4,
    publishedDaysAgo: 8,
    views: 3180,
    author: authors.zahra,
    tags: ["قیمت مسکن", "تحلیل بازار", "سرمایه‌گذاری"],
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        text: "بازار مسکن قم در فصل جاری روندی نسبتاً باثبات را تجربه کرده است. با وجود نوسان‌های مقطعی، تقاضای واقعی برای واحدهای میان‌متراژ همچنان بالاست و همین موضوع کف قیمت را در محله‌های پرتقاضا حفظ کرده است.",
      },
      { type: "heading", text: "محله‌های پیشرو" },
      {
        type: "paragraph",
        text: "پردیسان و سالاریه با تراکم بالای نوسازها بیشترین حجم معامله را داشته‌اند، در حالی که زنبیل‌آباد به‌عنوان گزینه سرمایه‌گذاری میان‌مدت مورد توجه قرار گرفته است.",
      },
      {
        type: "callout",
        title: "نکته کلیدی",
        text: "در بازار فعلی، واحدهای نوساز با متراژ ۹۰ تا ۱۳۰ متر بیشترین نقدشوندگی را دارند و سریع‌تر از سایر گزینه‌ها به فروش می‌رسند.",
      },
      { type: "heading", text: "پیش‌بینی ماه‌های آینده" },
      {
        type: "paragraph",
        text: "با توجه به شرایط تورمی و محدودیت عرضه واحدهای نوساز، انتظار می‌رود قیمت‌ها در محله‌های اصلی روند صعودی ملایمی داشته باشند. توصیه ما به خریداران مصرفی، تصمیم‌گیری به‌موقع و پرهیز از انتظار برای اصلاح شدید قیمت است.",
      },
      closingCallout,
    ],
  },
  {
    id: "a3",
    title: "رهن و اجاره یا خرید؟ کدام برای شما مناسب‌تر است",
    excerpt:
      "مقایسه‌ای عملی بین دو مسیر رایج تأمین مسکن، متناسب با بودجه و شرایط زندگی شما.",
    category: "guide",
    readMinutes: 5,
    publishedDaysAgo: 14,
    views: 2670,
    author: authors.ali,
    tags: ["رهن و اجاره", "خرید ملک", "بودجه‌بندی"],
    content: [
      {
        type: "paragraph",
        text: "انتخاب بین اجاره و خرید، بیش از آنکه یک تصمیم صرفاً مالی باشد، به سبک زندگی و افق زمانی شما بستگی دارد. در این مطلب معیارهای اصلی این تصمیم را کنار هم می‌گذاریم.",
      },
      { type: "heading", text: "چه زمانی اجاره منطقی‌تر است؟" },
      {
        type: "list",
        items: [
          "افق سکونت کوتاه‌مدت (کمتر از سه سال)",
          "نیاز به انعطاف برای جابه‌جایی شغلی",
          "نبود نقدینگی کافی برای پیش‌پرداخت خرید",
        ],
      },
      { type: "heading", text: "چه زمانی خرید ارجحیت دارد؟" },
      {
        type: "list",
        items: [
          "قصد سکونت بلندمدت در یک محله مشخص",
          "دسترسی به بخش قابل‌توجهی از سرمایه",
          "تمایل به تثبیت هزینه مسکن در برابر تورم",
        ],
      },
      {
        type: "quote",
        text: "اجاره هزینه امروز شماست؛ خرید سرمایه‌گذاری برای فرداست. انتخاب درست به برنامه زندگی شما بستگی دارد.",
      },
      closingCallout,
    ],
  },
  {
    id: "b4",
    title: "نکات حقوقی مبایعه‌نامه که هر خریداری باید بداند",
    excerpt:
      "از شرط فسخ تا تعهد تحویل؛ بندهایی که نبودشان می‌تواند دردسرساز شود.",
    category: "legal",
    readMinutes: 7,
    publishedDaysAgo: 20,
    views: 1980,
    author: authors.hossein,
    tags: ["مبایعه‌نامه", "قرارداد", "حقوق ملک"],
    content: [
      {
        type: "paragraph",
        text: "مبایعه‌نامه ستون فقرات هر معامله ملکی است. یک قرارداد دقیق، از منافع هر دو طرف محافظت می‌کند و مسیر انتقال سند را روشن می‌سازد.",
      },
      { type: "heading", text: "بندهای حیاتی قرارداد" },
      {
        type: "list",
        ordered: true,
        items: [
          "مشخصات کامل و کدرهگیری ملک",
          "مبلغ کل و جدول زمان‌بندی پرداخت",
          "تاریخ دقیق تحویل و تنظیم سند رسمی",
          "شرط و وجه‌التزام در صورت تخلف هر طرف",
        ],
      },
      {
        type: "callout",
        title: "هشدار",
        text: "هرگز پیش از استعلام عدم بازداشت ملک و تطبیق هویت فروشنده، مبلغی پرداخت نکنید. این ساده‌ترین راه پیشگیری از کلاهبرداری است.",
      },
      {
        type: "paragraph",
        text: "در گروه املاک کومه، قراردادها پیش از امضا توسط وکیل پایه‌یک دادگستری بررسی می‌شوند تا امنیت حقوقی معامله تضمین شود.",
      },
      closingCallout,
    ],
  },
  {
    id: "b5",
    title: "چطور خانه‌ای برای زندگی خانوادگی در قم انتخاب کنیم",
    excerpt:
      "معیارهایی فراتر از متراژ و قیمت که کیفیت زندگی روزمره شما را می‌سازند.",
    category: "lifestyle",
    readMinutes: 5,
    publishedDaysAgo: 27,
    views: 1540,
    author: authors.maryam,
    tags: ["سبک زندگی", "خانواده", "انتخاب خانه"],
    content: [
      {
        type: "paragraph",
        text: "خانه خوب فقط چهار دیوار نیست؛ بستری است که روزمرگی خانواده در آن شکل می‌گیرد. هنگام انتخاب، به عواملی فراتر از قیمت و متراژ توجه کنید.",
      },
      { type: "heading", text: "نور و تهویه طبیعی" },
      {
        type: "paragraph",
        text: "واحدهای رو به جنوب و شرق در طول روز نور بیشتری دریافت می‌کنند و هزینه سرمایش و روشنایی را کاهش می‌دهند. کیفیت نورگیری را حتماً در بازدید حضوری بسنجید.",
      },
      { type: "heading", text: "همسایگی و امنیت" },
      {
        type: "paragraph",
        text: "بافت اجتماعی ساختمان و محله، آرامش خانواده را مستقیم تحت تأثیر قرار می‌دهد. گفت‌وگوی کوتاه با همسایه‌ها می‌تواند تصویر واقعی‌تری از فضای زندگی به شما بدهد.",
      },
      closingCallout,
    ],
  },
  {
    id: "b6",
    title: "سرمایه‌گذاری در زمین؛ فرصت‌ها و ریسک‌های بازار قم",
    excerpt:
      "زمین همچنان یکی از امن‌ترین گزینه‌های سرمایه‌گذاری است، به‌شرط شناخت درست.",
    category: "market",
    readMinutes: 6,
    publishedDaysAgo: 34,
    views: 2110,
    author: authors.zahra,
    tags: ["زمین", "سرمایه‌گذاری", "کاربری"],
    content: [
      {
        type: "paragraph",
        text: "زمین به‌دلیل عرضه محدود و استهلاک‌ناپذیری، همواره یکی از گزینه‌های محبوب سرمایه‌گذاری بوده است. با این حال، موفقیت در این بازار نیازمند شناخت دقیق کاربری و موقعیت است.",
      },
      {
        type: "callout",
        title: "پیش از خرید بررسی کنید",
        text: "کاربری زمین (مسکونی، تجاری یا کشاورزی) و وضعیت آن در طرح تفصیلی شهر، تعیین‌کننده اصلی ارزش و امکان ساخت‌وساز است.",
      },
      { type: "heading", text: "ریسک‌های رایج" },
      {
        type: "list",
        items: [
          "اختلاف در حدود و مساحت واقعی زمین",
          "محدودیت‌های ساخت در برخی پهنه‌ها",
          "مشکلات سند مشاعی و افراز",
        ],
      },
      closingCallout,
    ],
  },
];

/** All posts, newest first. */
export function getBlogPosts(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => a.publishedDaysAgo - b.publishedDaysAgo
  );
}

export function getBlogPost(id: string): BlogPost | null {
  return blogPosts.find((post) => post.id === id) ?? null;
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.id);
}

/** The lead story for the list page: an explicit feature, else the newest. */
export function getFeaturedPost(): BlogPost {
  return (
    blogPosts.find((post) => post.isFeatured) ?? getBlogPosts()[0]
  );
}

/** Same category first, then most recent — for the detail page's "related". */
export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((item) => item.id !== post.id)
    .sort((a, b) => {
      const sameCategory =
        Number(b.category === post.category) -
        Number(a.category === post.category);
      if (sameCategory !== 0) return sameCategory;
      return a.publishedDaysAgo - b.publishedDaysAgo;
    })
    .slice(0, limit);
}

/** Newest posts excluding the current one — the sidebar widget. */
export function getRecentPosts(excludeId?: string, limit = 4): BlogPost[] {
  return getBlogPosts()
    .filter((post) => post.id !== excludeId)
    .slice(0, limit);
}

export function readTimeLabel(minutes: number): string {
  return `${minutes.toLocaleString("fa-IR")} دقیقه مطالعه`;
}

/** "۳ روز پیش" / "امروز" — matches the wording used elsewhere on the site. */
export function formatBlogDate(daysAgo: number): string {
  if (daysAgo === 0) return "امروز";
  if (daysAgo === 1) return "دیروز";
  if (daysAgo < 30) return `${daysAgo.toLocaleString("fa-IR")} روز پیش`;
  const months = Math.floor(daysAgo / 30);
  return `${months.toLocaleString("fa-IR")} ماه پیش`;
}
