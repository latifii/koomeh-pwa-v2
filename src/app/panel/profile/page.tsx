import type { Metadata } from "next";

import { SecuritySettings } from "@/app/panel/security/_components/security-form";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Typography } from "@/components/ui/typography";

import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = { title: "ویرایش مشخصات | پنل کومه" };

/**
 * One page, as the old site's «ویرایش مشخصات» was: the profile form with the
 * password change underneath it. `/panel/security` still exists in the code
 * for the day it grows (sessions, two-factor) but is parked — it redirects
 * here and nothing links to it.
 */
export default function ProfilePage() {
  return (
    <div>
      <PanelPageHeader
        title="ویرایش مشخصات"
        description="اطلاعات تماس و مشخصات حساب کاربری را مدیریت کنید."
      />
      <ProfileForm />

      <section aria-labelledby="account-security" className="mt-8">
        <Typography as="h2" variant="h4" id="account-security" className="mb-3">
          رمز عبور و امنیت
        </Typography>
        <SecuritySettings />
      </section>
    </div>
  );
}
