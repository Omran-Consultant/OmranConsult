import { Suspense } from "react";

import { AcceptInviteScreen } from "@/features/dashboard/auth/accept-invite-screen";

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteScreen />
    </Suspense>
  );
}
