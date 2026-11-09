import { existsSync } from "node:fs";
import path from "node:path";

/** Loads frontend `.env.local` into `process.env` without printing values. */
export function loadE2eEnv(): void {
  const envLocal = path.resolve(process.cwd(), ".env.local");
  if (existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  }

  process.env.OMRAN_E2E = "1";
  process.env.QUEUE_CONNECTION = "sync";
  process.env.E2E_DATABASE = process.env.E2E_DATABASE ?? "omranconsult_e2e";
}
