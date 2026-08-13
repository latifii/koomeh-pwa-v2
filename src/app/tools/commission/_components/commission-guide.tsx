import Image from "next/image";
import {
  Building2,
  FileWarning,
  Layers,
  MapPin,
  PiggyBank,
  ScrollText,
} from "lucide-react";

import commissionImage from "@/assets/images/commission/commission.webp";
import faskhImage from "@/assets/images/commission/faskh.webp";
import { Typography } from "@/components/ui/typography";
import { cityTariffs } from "@/data/commission";

export function CommissionGuide() {
  return (
    <article className="flex flex-col gap-12">
      {/* ---- What is commission -------------------------------------------- */}
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            <ScrollText className="size-4" />
            راهنمای کامل
          </Typography>
          <Typography variant="h3" as="h2">
            کمیسیون املاک چیست؟
          </Typography>
          <Typography variant="body" className="text-justify leading-loose">
            حق کمیسیون مشاورین املاک به کارمزدی گفته می‌شود که مشاورین به‌عنوان
            دستمزد دریافت می‌کنند. از سال ۱۳۷۹ بر اساس قانون، فرمول مشخصی برای
            محاسبهٔ حق کمیسیون در زمینهٔ خرید، فروش، رهن و اجارهٔ انواع املاک
            تجاری، مسکونی و اداری تعیین شده است. پرداخت کمیسیون یکی از قوانین
            معاملاتی کشور است و طرفین معامله ملزم به پرداخت آن هستند؛ این مبلغ بر
            اساس تعرفه‌ای که هر سال از سوی اتحادیهٔ مشاورین املاک هر شهر ابلاغ
            می‌شود، از طرفین دریافت می‌گردد.
          </Typography>
          <Typography variant="muted" className="text-justify leading-loose">
            این فرمول کشوری است، اما ملاک هر شهرستان نامهٔ اتحادیهٔ مشاورین املاک
            همان شهر است که ممکن است با فرمول کشوری اندکی تفاوت داشته باشد.
          </Typography>
        </div>
        <div className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
          <Image
            src={commissionImage}
            alt="محاسبه حق کمیسیون املاک"
            className="h-full w-full object-cover"
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      {/* ---- Why pay commission -------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <Typography variant="h3" as="h2">
          چرا کمیسیون پرداخت می‌کنیم؟
        </Typography>
        <Typography variant="body" className="text-justify leading-loose">
          خرید، فروش یا اجارهٔ ملک می‌تواند یک سرمایه‌گذاری مهم برای خانواده باشد
          و هیچ‌کس دوست ندارد سرمایهٔ خود را صرف خانه‌ای با مشکلات حقوقی و فنی
          کند. پیدا کردن ملکی مناسب از نظر موقعیت جغرافیایی، مصالح ساخت و اصول
          مهندسی، امری تخصصی و زمان‌بر است؛ به همین دلیل شغلی با عنوان «مشاور
          املاک» شکل گرفته که در ازای دریافت حق‌العمل، خدماتی تخصصی در حوزهٔ ملک
          ارائه می‌دهد. مجموعهٔ املاک کومه با بهره‌گیری از مشاوران متخصص، نیازهای
          ملکی شما را آسان، سریع و مطمئن برطرف می‌کند.
        </Typography>
      </section>

      {/* ---- Termination --------------------------------------------------- */}
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="order-2 overflow-hidden rounded-2xl ring-1 ring-foreground/10 md:order-1">
          <Image
            src={faskhImage}
            alt="حق کمیسیون در صورت فسخ قرارداد"
            className="h-full w-full object-cover"
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="order-1 flex flex-col gap-3 md:order-2">
          <Typography
            as="span"
            variant="small"
            className="flex items-center gap-1.5 font-medium text-brand"
          >
            <FileWarning className="size-4" />
            نکتهٔ حقوقی
          </Typography>
          <Typography variant="h3" as="h2">
            حق کمیسیون در صورت فسخ قرارداد
          </Typography>
          <Typography variant="body" className="text-justify leading-loose">
            در هر معامله‌ای امکان فسخ وجود دارد. از آنجا که حق کمیسیون در ازای
            خدماتی است که مشاور برای پیشبرد معامله و عقد قرارداد انجام داده،
            مشاورین پس از فسخ نیز می‌توانند حق کمیسیون خود را مطالبه کنند. فسخ
            قراردادها بر اساس مفاد قانونی و در شرایط خاص امکان‌پذیر است و در این
            حالت معمولاً تمام حق کمیسیون (حتی سهم طرف دوم) را طرف فسخ‌کننده
            پرداخت می‌کند.
          </Typography>
        </div>
      </section>

      {/* ---- Fixed vs tiered method --------------------------------------- */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Typography variant="h3" as="h2">
            روش‌های محاسبهٔ کمیسیون
          </Typography>
          <Typography variant="muted" className="text-justify leading-loose">
            نرخ کمیسیون در هر شهر توسط کمیسیون نظارت همان شهر تعیین می‌شود و نحوهٔ
            محاسبه عموماً به دو صورت انجام می‌گیرد.
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <PiggyBank className="size-5" />
            </div>
            <Typography variant="h4" as="h3">
              کمیسیون ثابت
            </Typography>
            <Typography variant="muted" className="text-justify leading-loose">
              در این روش درصد محاسبه ثابت است و افزایش قیمت تأثیری در آن ندارد؛
              مبلغ به‌صورت درصدی از ارزش کل معامله تعیین می‌شود. شهرهایی مانند قم
              و تهران از این روش استفاده می‌کنند.
            </Typography>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Layers className="size-5" />
            </div>
            <Typography variant="h4" as="h3">
              کمیسیون پله‌ای
            </Typography>
            <Typography variant="muted" className="text-justify leading-loose">
              در این روش مبلغ کل ملک در درصد محاسبه مؤثر است؛ تا سقفی مشخص با یک
              درصد و مازاد آن با درصدی پایین‌تر محاسبه می‌شود. شهرهایی مانند
              اصفهان و تبریز از این روش بهره می‌برند.
            </Typography>
          </div>
        </div>
      </section>

      {/* ---- City tariffs -------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Typography variant="h3" as="h2">
            نحوهٔ محاسبهٔ کمیسیون در شهرهای مختلف ایران
          </Typography>
          <Typography variant="muted" className="text-justify leading-loose">
            حق کمیسیون املاک تا اعلام رسمی کمیسیون نظارت هر شهر، با نرخ سال گذشته
            محاسبه می‌شود. تعرفهٔ خرید و فروش و رهن و اجاره در شهرهای اصلی به شرح
            زیر است.
          </Typography>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {cityTariffs.map((tariff) => (
            <div
              key={tariff.city}
              className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
            >
              <Typography
                variant="h4"
                as="h3"
                className="flex items-center gap-2"
              >
                <MapPin className="size-4 text-brand" />
                {tariff.city}
              </Typography>

              <div className="flex flex-col gap-1.5">
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1.5 font-medium text-brand"
                >
                  <Building2 className="size-3.5" />
                  خرید و فروش
                </Typography>
                <Typography
                  variant="muted"
                  className="text-justify leading-loose"
                >
                  {tariff.sale}
                </Typography>
              </div>

              <div className="flex flex-col gap-1.5">
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1.5 font-medium text-brand"
                >
                  <Building2 className="size-3.5" />
                  رهن و اجاره
                </Typography>
                <Typography
                  variant="muted"
                  className="text-justify leading-loose"
                >
                  {tariff.rent}
                </Typography>
              </div>

              {tariff.note ? (
                <Typography
                  variant="small"
                  className="rounded-lg bg-muted/60 p-3 text-justify leading-relaxed text-muted-foreground"
                >
                  {tariff.note}
                </Typography>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
