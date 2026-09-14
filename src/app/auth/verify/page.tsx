import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

/** The code step lives inside the sign-in flow now. */
export default function VerifyPage() {
  redirect(routes.auth.login);
}
