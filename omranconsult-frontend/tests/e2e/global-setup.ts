import { execFileSync } from "node:child_process";
import path from "node:path";

import { loadE2eEnv } from "./load-e2e-env";

const backendRoot = path.resolve(process.cwd(), "..", "omranconsult-backend");
const apiBase = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8000";

function assertMysql(): void {
  try {
    execFileSync("php", ["artisan", "e2e:preflight"], {
      cwd: backendRoot,
      env: process.env,
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        "[E2E] MySQL غير متصل. شغّل MAMP MySQL (منفذ 8889) ثم أعد تشغيل الاختبارات.",
        "[E2E] MySQL is not reachable. Start MAMP MySQL (port 8889) and retry.",
        detail,
      ].join("\n"),
    );
  }
}

async function assertApi(): Promise<void> {
  let health: Response;
  try {
    health = await fetch(`${apiBase}/api/health`, { signal: AbortSignal.timeout(8_000) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        `[E2E] الـ API غير متاح على ${apiBase}. شغّل: cd omranconsult-backend && composer run dev`,
        `[E2E] API is not reachable at ${apiBase}. Start: cd omranconsult-backend && composer run dev`,
        detail,
      ].join("\n"),
    );
  }

  if (!health.ok) {
    throw new Error(
      `[E2E] /api/health أعاد ${health.status} / returned ${health.status}. تحقق من Laravel على :8000.`,
    );
  }

  try {
    execFileSync("php", ["artisan", "e2e:prepare-database"], {
      cwd: backendRoot,
      env: { ...process.env, DB_DATABASE: process.env.E2E_DATABASE },
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[E2E] تعذّر تجهيز قاعدة الاختبار ${process.env.E2E_DATABASE} / prepare-database failed.\n${detail}`,
    );
  }

  try {
    execFileSync("php", ["artisan", "e2e:arm-harness"], {
      cwd: backendRoot,
      env: process.env,
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[E2E] تعذّر تفعيل وضع الاختبار (sync queue) / failed to arm E2E harness.\n${detail}`,
    );
  }

  let preflight: Response;
  try {
    preflight = await fetch(`${apiBase}/api/e2e/preflight`, { signal: AbortSignal.timeout(8_000) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`[E2E] تعذّر التحقق من preflight / preflight check failed.\n${detail}`);
  }

  if (!preflight.ok) {
    throw new Error(
      `[E2E] /api/e2e/preflight أعاد ${preflight.status}. تحقق من قاعدة البيانات والـ API.`,
    );
  }

  const body = (await preflight.json()) as { database?: string; queue?: string };
  if (body.database !== "ok") {
    throw new Error(
      "[E2E] قاعدة البيانات غير جاهزة على الـ API / API database check failed. شغّل MAMP MySQL.",
    );
  }

  if (body.queue !== "sync") {
    throw new Error(
      [
        "[E2E] الطابور ليس sync بعد e2e:arm-harness. أعد تشغيل Laravel: composer run dev ثم أعد الاختبار.",
        "[E2E] API queue is not sync after e2e:arm-harness. Restart Laravel (composer run dev) and retry.",
      ].join("\n"),
    );
  }
}

export default async function globalSetup(): Promise<void> {
  loadE2eEnv();

  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    throw new Error(
      "[E2E] E2E_ADMIN_EMAIL و E2E_ADMIN_PASSWORD مطلوبان / must be set for the dashboard suite.",
    );
  }

  assertMysql();
  await assertApi();

  execFileSync("php", ["artisan", "e2e:ensure-users"], {
    cwd: backendRoot,
    env: {
      ...process.env,
      DB_DATABASE: process.env.E2E_DATABASE,
      OMRAN_E2E: "1",
      QUEUE_CONNECTION: "sync",
    },
    stdio: "pipe",
  });
}
