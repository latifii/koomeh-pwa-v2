import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session-cookie";
import { panelHomeFor } from "@/lib/auth/panel-access";
import { panelViewer } from "@/lib/auth/permissions";

/** Staff land on the dashboard; a regular member on their files. */
export default async function PanelPage() {
  const session = await getSession();
  redirect(panelHomeFor(panelViewer(session?.user)));
}
