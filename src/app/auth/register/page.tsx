import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/**
 * There is no separate sign-up: a number the site has never seen gets its
 * account in the sign-in flow. The old address keeps working by going there.
 */
export default function RegisterPage() {
  redirect(routes.auth.login);
}
