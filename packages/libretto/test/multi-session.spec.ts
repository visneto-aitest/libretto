import { describe, expect } from "vitest";
import { test } from "./fixtures";

function extractReturnedSessionId(output: string): string | null {
  const patterns = [
    /\(session:\s*([a-zA-Z0-9._-]+)\)/i,
    /session id[:=]\s*([a-zA-Z0-9._-]+)/i,
    /session[:=]\s*([a-zA-Z0-9._-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function requireReturnedSessionId(
  command: string,
  stdout: string,
  stderr: string,
): string {
  const combined = `${stdout}\n${stderr}`;
  const sessionId = extractReturnedSessionId(combined);
  if (!sessionId) {
    throw new Error(
      `Could not find a returned session id for "${command}".\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }
  return sessionId;
}

describe("multi-session CLI behavior", () => {
  test("open twice without --session creates distinct sessions", async ({
    librettoCli,
  }) => {
    const firstOpen = await librettoCli("open https://example.com --headless");
    expect(firstOpen.stdout).toContain("Browser open");
    const firstSessionId = requireReturnedSessionId(
      "open",
      firstOpen.stdout,
      firstOpen.stderr,
    );

    const secondOpen = await librettoCli("open https://example.com --headless");
    expect(secondOpen.stderr).not.toContain(
      `Session "${firstSessionId}" is already open and connected to`,
    );
    expect(secondOpen.stdout).toContain("Browser open");
    const secondSessionId = requireReturnedSessionId(
      "open",
      secondOpen.stdout,
      secondOpen.stderr,
    );

    expect(secondSessionId).not.toBe(firstSessionId);
  }, 60_000);
});
