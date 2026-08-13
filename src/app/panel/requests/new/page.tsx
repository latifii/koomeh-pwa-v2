import { Typography } from "@/components/ui/typography";
import { CustomerRequestForm } from "../_components/customer-request-form";

export default function NewCustomerRequestPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Typography variant="eyebrow">ثبت درخواست جدید</Typography>
        <Typography
          as="h1"
          variant="h2"
          className="text-2xl tracking-normal sm:text-3xl"
        >
          ثبت تقاضای ملک
        </Typography>
        <Typography variant="lead">
          نیازمندی‌های متقاضی را کامل ثبت کنید تا پیشنهادهای دقیق‌تری ارائه شود.
        </Typography>
      </div>
      <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
        <Typography variant="small" className="text-foreground">
          فیلدهای ستاره‌دار برای ثبت درخواست ضروری هستند؛ سایر اطلاعات را
          می‌توانید بعداً تکمیل کنید.
        </Typography>
      </div>
      <CustomerRequestForm />
    </div>
  );
}
