import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { ProfileForm } from "./_components/profile-form";

export const metadata: Metadata = { title: "ویرایش مشخصات | پنل کومه" };

/**
 * One page, as the old site's «ویرایش مشخصات» was: picture, details, social
 * networks, password and sessions. `/panel/security` still exists in the code
 * for the day it grows (two-factor, a device list) but is parked — it
 * redirects here and nothing links to it.
 */
export default function ProfilePage() {
  return (
    <div>
      <PanelPageHeader
        title="ویرایش مشخصات"
        description="عکس، اطلاعات تماس، شبکه‌های اجتماعی و رمز عبور حساب خود را از همین‌جا مدیریت کنید."
      />
      <ProfileForm />
    </div>
  );
}
