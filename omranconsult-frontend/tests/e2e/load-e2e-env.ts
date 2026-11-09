import { existsSync } from "node:fs";
import path from "node:path";

/** Loads frontend `.env.local` into `process.env` without printing values. */
export function loadE2eEnv(): void {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  if (existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  }
}
