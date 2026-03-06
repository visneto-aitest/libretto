import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createServer } from "node:net";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { ensureLibrettoSessionStatePath } from "../runtime/paths.js";
import { SESSION_STATE_VERSION, SessionStateFileSchema } from "../state/session-state.js";

async function pickFreePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        server.close(() => resolve(addr.port));
        return;
      }
      server.close(() => reject(new Error("Failed to resolve debug port")));
    });
  });
}

export type LaunchBrowserArgs = {
  sessionName: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
  storageStatePath?: string;
};

export type BrowserSession = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  debugPort: number;
  metadataPath: string;
  close: () => Promise<void>;
};

export async function launchBrowser({
  sessionName,
  headless = false,
  viewport = { width: 1366, height: 768 },
  storageStatePath,
}: LaunchBrowserArgs): Promise<BrowserSession> {
  const debugPort = await pickFreePort();
  const browser = await chromium.launch({
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      `--remote-debugging-port=${debugPort}`,
      "--no-focus-on-check",
    ],
  });

  const context = await browser.newContext({
    viewport,
    ...(storageStatePath ? { storageState: storageStatePath } : {}),
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  page.setDefaultNavigationTimeout(45_000);

  const metadataPath = ensureLibrettoSessionStatePath(sessionName);
  const previousState =
    existsSync(metadataPath) ? readFileSync(metadataPath, "utf-8") : null;
  let previousStateObject: Record<string, unknown> = {};

  if (previousState) {
    try {
      const parsed = JSON.parse(previousState) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        previousStateObject = parsed as Record<string, unknown>;
      }
    } catch {}
  }

  const parsedPreviousState = SessionStateFileSchema.safeParse(previousStateObject);

  const preservedRunId =
    parsedPreviousState.success
      ? parsedPreviousState.data.runId
      : `runtime-${Date.now()}`;
  const preservedVersion =
    parsedPreviousState.success
      ? parsedPreviousState.data.version
      : SESSION_STATE_VERSION;

  writeFileSync(
    metadataPath,
    JSON.stringify(
      {
        ...previousStateObject,
        version: preservedVersion,
        session: sessionName,
        port: debugPort,
        pid: process.pid,
        runId: preservedRunId,
        startedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  return {
    browser,
    context,
    page,
    debugPort,
    metadataPath,
    close: async () => {
      await browser.close();
      if (previousState === null) {
        if (existsSync(metadataPath)) {
          try { unlinkSync(metadataPath); } catch {}
        }
        return;
      }

      try {
        writeFileSync(metadataPath, previousState, "utf-8");
      } catch {}
    },
  };
}
