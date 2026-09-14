import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/**
 * Recovery is the sign-in flow with a code instead of the password: the
 * code signs the account in and sends it to set a new password.
 */
export default function ForgotPasswordPage() {
  redirect(`${routes.auth.login}?forgot=1`);
}
