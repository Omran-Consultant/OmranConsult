import { execFileSync } from "node:child_process";
import path from "node:path";

const backendRoot = path.resolve(process.cwd(), "..", "omranconsult-backend");

export function artisan(args: string[]): string {
  return execFileSync("php", ["artisan", ...args], {
    cwd: backendRoot,
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
