import { execFileSync } from "node:child_process";
import path from "node:path";

const backendRoot = path.resolve(process.cwd(), "..", "omranconsult-backend");

export default function globalTeardown(): void {
  try {
    execFileSync("php", ["artisan", "e2e:disarm-harness"], {
      cwd: backendRoot,
      env: process.env,
      stdio: "pipe",
    });
  } catch {
    // Best-effort: local API may already be stopped.
  }
}
