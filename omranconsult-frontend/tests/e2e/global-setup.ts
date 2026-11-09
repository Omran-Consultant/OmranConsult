import { execFileSync } from "node:child_process";
import path from "node:path";

import { loadE2eEnv } from "./load-e2e-env";

export default function globalSetup(): void {
  loadE2eEnv();

  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    throw new Error("E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for the dashboard suite.");
  }

  execFileSync("php", ["artisan", "e2e:ensure-users"], {
    cwd: path.resolve(process.cwd(), "..", "omranconsult-backend"),
    env: process.env,
    stdio: "pipe",
  });
}
