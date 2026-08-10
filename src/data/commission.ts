/**
 * Real-estate commission rules for Qom, ported from the legacy melk_v2
 * calculator. All money is in Toman. The 10% figure is VAT (مالیات بر ارزش
 * افزوده) added on top of the raw commission, and the raw commission is split
 * evenly between the two sides of the deal (each party pays half).
 */

export const VAT_RATE = 0.1;

export type DealType = "sale" | "rent";

export type CommissionResult = {
  /** Raw commission before VAT (both parties combined). */
  base: number;
  /** VAT charged on the raw commission. */
  vat: number;
  /** base + vat — the full amount the deal generates. */
  total: number;
  /** What each side (buyer/seller or landlord/tenant) pays. */
  perParty: number;
};

/**
 * خرید و فروش: ۱٪ تا سقف ۱۰ میلیون تومان، و بالاتر از آن ۰٫۵٪ به‌علاوهٔ ۵۰٬۰۰۰
 * تومان مقطوع — سپس ۱۰٪ ارزش افزوده.
 */
function saleCommission(price: number): number {
  if (price <= 0) return 0;
  return price <= 10_000_000 ? price * 0.01 : price * 0.005 + 50_000;
}

/**
 * رهن و اجاره: به ازای هر یک میلیون تومان ودیعه ۶٬۰۰۰ تومان، به‌علاوهٔ ۴۰٪ اجارهٔ
 * ماهانه تا سقف ۱۰۰٬۰۰۰ تومان و ۳۰٪ برای مازاد آن — سپس ۱۰٪ ارزش افزوده.
 */
function rentCommission(deposit: number, rent: number): number {
  const depositPart = (Math.max(deposit, 0) / 1_000_000) * 6_000;
  const rentPart =
    rent <= 100_000
      ? Math.max(rent, 0) * 0.4
      : (rent - 100_000) * 0.3 + 40_000;
  return depositPart + rentPart;
}

export function calculateCommission(input: {
  type: DealType;
  price?: number;
  deposit?: number;
  rent?: number;
}): CommissionResult {
  const base =
    input.type === "sale"
      ? saleCommission(input.price ?? 0)
      : rentCommission(input.deposit ?? 0, input.rent ?? 0);

  const vat = base * VAT_RATE;
  const total = base + vat;

  return {
    base: Math.round(base),
    vat: Math.round(vat),
    total: Math.round(total),
    perParty: Math.round(total / 2),
  };
}

// --- City tariffs shown in the editorial guide --------------------------------

export type CityTariff = {
  city: string;
  /** Buy & sell rule for this city. */
  sale: string;
  /** Mortgage & rent rule for this city. */
  rent: string;
  /** Optional extra note (e.g. contract renewal). */
  note?: string;
};

export const cityTariffs: CityTariff[] = [
  {
    city: "قم",
    sale: "هر یک از طرفین ۰٫۲۵٪ قیمت ملک؛ در مجموع کل کمیسیون معادل ۰٫۵٪ ارزش معامله است که میان طرفین تقسیم می‌شود.",
    rent: "به ازای هر یک میلیون تومان رهن ۶٬۰۰۰ تومان، به‌علاوهٔ درصدی از اجارهٔ ماهانه؛ سپس ۱۰٪ مالیات بر ارزش افزوده.",
  },
  {
    city: "تهران",
    sale: "کمیسیون ثابت؛ هر یک از طرفین ۰٫۲۵٪ قیمت ملک را می‌پردازد (در مجموع ۰٫۵٪ ارزش معامله).",
    rent: "تبدیل رهن به اجاره و جمع با اجارهٔ ماهانه، سپس ۳۰٪ این مبلغ به‌عنوان حق کمیسیون؛ به‌علاوهٔ ۱۰٪ ارزش افزوده.",
    note: "کمیسیون تمدید اجاره برابر یک‌دهم کمیسیون قرارداد اجاره است.",
  },
  {
    city: "کرج",
    sale: "کمیسیون ثابت؛ کل کمیسیون خرید و فروش ۰٫۷۵٪ ارزش معامله است که میان طرفین تقسیم می‌شود.",
    rent: "تبدیل رهن به اجاره و جمع با اجارهٔ ماهانه؛ ۰٫۲۵٪ این مبلغ به‌عنوان کمیسیون، به‌علاوهٔ ۱۰٪ ارزش افزوده.",
    note: "مستأجر نصف مبلغ کمیسیون و مالک مبلغ کامل را می‌پردازد.",
  },
  {
    city: "اصفهان",
    sale: "کمیسیون پله‌ای؛ تا سقف ۲۰۰ میلیون تومان ۰٫۵٪ و برای مازاد آن ۰٫۲۵٪ برای هر یک از طرفین، به‌علاوهٔ ۱۰٪ ارزش افزوده.",
    rent: "به ازای هر یک میلیون تومان رهن ۷٬۵۰۰ تومان، به‌علاوهٔ یک‌چهارم اجارهٔ یک ماه و ۱۰٪ ارزش افزوده برای هر طرف.",
    note: "طبق بخشنامهٔ اتحادیهٔ اصفهان، تبدیل نرخ رهن به اجاره جهت محاسبهٔ کمیسیون ممنوع است.",
  },
  {
    city: "تبریز",
    sale: "کمیسیون چندپله‌ای؛ از ۰٫۷۵٪ تا سقف ۲۰ میلیون تومان شروع و به‌تدریج تا ۰٫۱٪ برای مبالغ بالای ۵۰۰ میلیون تومان کاهش می‌یابد.",
    rent: "تبدیل رهن به اجاره و جمع با اجارهٔ ماهانه، سپس ۳۳٪ این مبلغ به‌عنوان کمیسیون، به‌علاوهٔ ۱۰٪ ارزش افزوده.",
    note: "کمیسیون تمدید اجاره یک‌دهم کمیسیون قرارداد به‌علاوهٔ مالیات ارزش افزوده است.",
  },
];
