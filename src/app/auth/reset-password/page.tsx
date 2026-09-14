import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/**
 * A new password is set in the panel after signing in with a recovery
 * code; the flow sends people there itself. The old address follows.
 */
export default function ResetPasswordPage() {
  redirect(`${routes.panel.profile}#password`);
}
