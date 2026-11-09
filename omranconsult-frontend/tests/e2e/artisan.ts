import { execFileSync } from "node:child_process";
import path from "node:path";

const backendRoot = path.resolve(process.cwd(), "..", "omranconsult-backend");

function artisanEnv(): NodeJS.ProcessEnv {
  const e2eDatabase = process.env.E2E_DATABASE ?? "omranconsult_e2e";
  return {
    ...process.env,
    DB_DATABASE: e2eDatabase,
    OMRAN_E2E: "1",
    QUEUE_CONNECTION: "sync",
  };
}

export function artisan(args: string[]): string {
  return execFileSync("php", ["artisan", ...args], {
    cwd: backendRoot,
    encoding: "utf8",
    env: artisanEnv(),
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
