import { Suspense } from "react";

import { ResetPasswordScreen } from "@/features/dashboard/auth/reset-password-screen";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
