import type { Gender } from "./avatars";

export type DealType = "sale" | "rent";

export type PropertyType =
  | "apartment"
  | "villa"
  | "land"
  | "commercial"
  | "office"
  | "industrial";

export interface Estate {
  id: string;
  title: string;
  district: string;
  dealType: DealType;
  propertyType: PropertyType;
  /** Total price — shown for sale files. */
  price: string;
  /** Rent files only: deposit ("ودیعه") and monthly rent, shown side by side. */
  deposit?: string;
  monthlyRent?: string;
  area: number;
  rooms: number;
  baths: number;
  agentName: string;
  agentGender: "male" | "female";
  agentPhoto?: string;
  coverImage?: string;
  locationLabel?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  hasTour?: boolean;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAtLabel: string;
  image?: string;
}

export interface Agent {
  id: string;
  name: string;
  branch: string;
  rank: 1 | 2 | 3;
  /** Display score (Persian digits) plus its numeric twin for the ranking bar. */
  score: string;
  scoreValue: number;
  deals?: string;
  gender: Gender;
  photo?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  coverImage?: string;
}

export interface AreaGuide {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: "آپارتمان",
  villa: "خانه ویلایی",
  land: "زمین و باغ",
  commercial: "تجاری",
  office: "دفتر کار",
  industrial: "صنعتی",
};

export const saleEstates: Estate[] = [
  {
    id: "s1",
    title: "آپارتمان نوساز سه‌خوابه",
    district: "پردیسان",
    dealType: "sale",
    propertyType: "apartment",
    price: "۴٬۲۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 132,
    rooms: 3,
    baths: 2,
    agentName: "علی محمدی",
    agentGender: "male",
    isNew: true,
  },
  {
    id: "s2",
    title: "خانه ویلایی حیاط‌دار",
    district: "شهرک قدس",
    dealType: "sale",
    propertyType: "villa",
    price: "۹٬۸۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 240,
    rooms: 4,
    baths: 3,
    agentName: "زهرا احمدی",
    agentGender: "female",
    hasTour: true,
  },
  {
    id: "s3",
    title: "آپارتمان بازسازی‌شده",
    district: "جمهوری",
    dealType: "sale",
    propertyType: "apartment",
    price: "۲٬۹۵۰٬۰۰۰٬۰۰۰ تومان",
    area: 95,
    rooms: 2,
    baths: 1,
    agentName: "حسین رضایی",
    agentGender: "male",
    hasTour: true,
  },
  {
    id: "s4",
    title: "واحد تجاری خیابان اصلی",
    district: "صفاشهر",
    dealType: "sale",
    propertyType: "commercial",
    price: "۶٬۱۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 60,
    rooms: 1,
    baths: 1,
    agentName: "مریم کریمی",
    agentGender: "female",
  },
  {
    id: "s5",
    title: "زمین با کاربری مسکونی",
    district: "زنبیل‌آباد",
    dealType: "sale",
    propertyType: "land",
    price: "۵٬۴۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 200,
    rooms: 0,
    baths: 0,
    agentName: "امیر حسینی",
    agentGender: "male",
  },
  {
    id: "s6",
    title: "آپارتمان دیدار به پارک",
    district: "کریمی",
    dealType: "sale",
    propertyType: "apartment",
    price: "۳٬۷۵۰٬۰۰۰٬۰۰۰ تومان",
    area: 110,
    rooms: 2,
    baths: 2,
    agentName: "سارا نوری",
    agentGender: "female",
    isNew: true,
  },
  {
    id: "s7",
    title: "خانه ویلایی دوبلکس",
    district: "فردوسی",
    dealType: "sale",
    propertyType: "villa",
    price: "۷٬۲۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 180,
    rooms: 3,
    baths: 2,
    agentName: "علی محمدی",
    agentGender: "male",
  },
  {
    id: "s8",
    title: "آپارتمان نزدیک حرم",
    district: "سالاریه",
    dealType: "sale",
    propertyType: "apartment",
    price: "۵٬۱۰۰٬۰۰۰٬۰۰۰ تومان",
    area: 145,
    rooms: 3,
    baths: 2,
    agentName: "زهرا احمدی",
    agentGender: "female",
    hasTour: true,
  },
];

export const rentEstates: Estate[] = [
  {
    id: "r1",
    title: "آپارتمان مبله تک‌خواب",
    district: "پردیسان",
    dealType: "rent",
    propertyType: "apartment",
    price: "رهن ۲۰۰ / اجاره ۱۲٬۰۰۰٬۰۰۰ تومان",
    deposit: "۲۰۰ میلیون",
    monthlyRent: "۱۲ میلیون",
    area: 70,
    rooms: 1,
    baths: 1,
    agentName: "حسین رضایی",
    agentGender: "male",
  },
  {
    id: "r2",
    title: "خانه ویلایی حیاط‌دار",
    district: "شهرک قدس",
    dealType: "rent",
    propertyType: "villa",
    price: "رهن کامل ۱٬۸۰۰٬۰۰۰٬۰۰۰ تومان",
    deposit: "۱٫۸ میلیارد",
    monthlyRent: "رهن کامل",
    area: 200,
    rooms: 3,
    baths: 2,
    agentName: "مریم کریمی",
    agentGender: "female",
  },
  {
    id: "r3",
    title: "واحد اداری-تجاری",
    district: "جمهوری",
    dealType: "rent",
    propertyType: "commercial",
    price: "رهن ۳۰۰ / اجاره ۱۸٬۰۰۰٬۰۰۰ تومان",
    deposit: "۳۰۰ میلیون",
    monthlyRent: "۱۸ میلیون",
    area: 55,
    rooms: 1,
    baths: 1,
    agentName: "امیر حسینی",
    agentGender: "male",
  },
  {
    id: "r4",
    title: "آپارتمان دو‌خوابه دیدارباز",
    district: "کریمی",
    dealType: "rent",
    propertyType: "apartment",
    price: "رهن ۴۰۰ / اجاره ۲۵٬۰۰۰٬۰۰۰ تومان",
    deposit: "۴۰۰ میلیون",
    monthlyRent: "۲۵ میلیون",
    area: 105,
    rooms: 2,
    baths: 1,
    agentName: "سارا نوری",
    agentGender: "female",
  },
];

export const branches: Branch[] = [
  {
    id: "b1",
    name: "شعبه پردیسان",
    address: "قم، پردیسان، بلوار پژوهش",
    phone: "۰۲۵-۳۳۱۲۳۴۵۶",
  },
  {
    id: "b2",
    name: "شعبه جمهوری",
    address: "قم، خیابان جمهوری اسلامی",
    phone: "۰۲۵-۳۷۱۲۳۴۵۶",
  },
  {
    id: "b3",
    name: "شعبه صدوقی",
    address: "قم، بلوار صدوقی",
    phone: "۰۲۵-۳۸۱۲۳۴۵۶",
  },
  {
    id: "b4",
    name: "شعبه زمرد",
    address: "قم، شهرک زمرد",
    phone: "۰۲۵-۳۹۱۲۳۴۵۶",
  },
];

export const homeFaqs: Faq[] = [
  {
    question: "گروه املاک کومه چه خدماتی در قم ارائه می‌دهد؟",
    answer:
      "گروه املاک کومه در قم خدمات خرید، فروش و اجاره انواع ملک از جمله آپارتمان، خانه ویلایی و زمین را به صورت تخصصی و با پشتیبانی کامل ارائه می‌دهد.",
  },
  {
    question: "چگونه می‌توانم ملکی در قم پیدا کنم؟",
    answer:
      "شما می‌توانید از طریق وب‌سایت گروه املاک کومه یا مراجعه حضوری به دفتر، ملک مورد نظر خود را جستجو و با مشاوران ما ارتباط برقرار کنید.",
  },
  {
    question: "آیا گروه املاک کومه به مشاوران حرفه‌ای مجهز است؟",
    answer:
      "بله، گروه املاک کومه دارای تیمی از مشاوران آموزش‌دیده و باتجربه در بازار املاک قم است تا شما را در خرید، فروش و اجاره ملک راهنمایی کنند.",
  },
  {
    question: "آیا امکان بازدید حضوری از املاک وجود دارد؟",
    answer:
      "بله، پس از انتخاب ملک مورد نظر، مشاوران گروه املاک کومه در قم برنامه بازدید حضوری برای شما ترتیب می‌دهند.",
  },
  {
    question: "آیا گروه املاک کومه خدمات حقوقی هم ارائه می‌دهد؟",
    answer:
      "بله، گروه املاک کومه با وکلای مجرب همکاری می‌کند تا خرید، فروش و اجاره ملک در قم با امنیت و شفافیت کامل انجام شود.",
  },
  {
    question: "قیمت املاک در قم چگونه مشخص می‌شود؟",
    answer:
      "قیمت‌ها بر اساس منطقه، متراژ، نوع ملک و وضعیت بازار تعیین می‌شود. مشاوران گروه املاک کومه به شما در تعیین قیمت مناسب کمک می‌کنند.",
  },
  {
    question: "چگونه می‌توانم با گروه املاک کومه تماس بگیرم؟",
    answer:
      "می‌توانید از طریق شماره‌تماس‌های موجود در وب‌سایت، فرم تماس آنلاین یا مراجعه حضوری با گروه املاک کومه ارتباط برقرار کنید.",
  },
  {
    question: "آیا امکان ثبت ملک برای فروش یا اجاره در سایت وجود دارد؟",
    answer:
      "بله، مالکین می‌توانند ملک خود را در وب‌سایت گروه املاک کومه ثبت کنند تا در کوتاه‌ترین زمان به مشتریان واقعی معرفی شود.",
  },
];
