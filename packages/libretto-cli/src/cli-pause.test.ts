import { describe, expect } from "vitest";
import { test } from "./test-fixtures";

describe("CLI pause behavior", () => {
  test("resume waits until workflow completes", async ({
    librettoCli,
    librettoRuntimePath,
    seedSessionPermission,
    seedSessionState,
    writeWorkflowScript,
  }) => {
    await seedSessionPermission("default", "interactive");
    await seedSessionState({ session: "default", mode: "interactive" });
    const integrationFilePath = await writeWorkflowScript(
      "integration-pause-once.mjs",
      `
import { workflow } from "${
  librettoRuntimePath
}";

export const main = workflow({}, async (ctx) => {
  console.log("WORKFLOW_BEFORE_PAUSE");
  await ctx.pause();
  console.log("WORKFLOW_AFTER_PAUSE");
});
`,
    );

    try {
      const runResult = await librettoCli(
        `run "${integrationFilePath}" main --session default --headless --debug`,
      );
      expect(runResult.exitCode).toBe(0);
      expect(runResult.stdout).toContain("WORKFLOW_BEFORE_PAUSE");
      expect(runResult.stdout).toContain("Workflow paused.");
      expect(runResult.stdout).not.toContain("WORKFLOW_AFTER_PAUSE");
      expect(runResult.stdout).not.toContain("Integration completed.");

      const resumeResult = await librettoCli("resume --session default");
      expect(resumeResult.exitCode).toBe(0);
      expect(resumeResult.stdout).toContain(
        'Resume signal sent for session "default".',
      );
      expect(resumeResult.stdout).toContain("WORKFLOW_AFTER_PAUSE");
      expect(resumeResult.stdout).toContain("Integration completed.");
    } finally {
      await librettoCli("close --session default");
    }
  }, 45_000);

  test("resume returns when workflow pauses again", async ({
    librettoCli,
    librettoRuntimePath,
    seedSessionPermission,
    seedSessionState,
    writeWorkflowScript,
  }) => {
    await seedSessionPermission("default", "interactive");
    await seedSessionState({ session: "default", mode: "interactive" });
    const integrationFilePath = await writeWorkflowScript(
      "integration-pause-twice.mjs",
      `
import { workflow } from "${
  librettoRuntimePath
}";

export const main = workflow({}, async (ctx) => {
  console.log("WORKFLOW_BEFORE_PAUSE_1");
  await ctx.pause();
  console.log("WORKFLOW_BETWEEN_PAUSES");
  await ctx.pause();
  console.log("WORKFLOW_AFTER_PAUSE_2");
});
`,
    );

    try {
      const runResult = await librettoCli(
        `run "${integrationFilePath}" main --session default --headless --debug`,
      );
      expect(runResult.exitCode).toBe(0);
      expect(runResult.stdout).toContain("Workflow paused.");
      expect(runResult.stdout).not.toContain("WORKFLOW_AFTER_PAUSE_2");

      const firstResume = await librettoCli("resume --session default");
      expect(firstResume.exitCode).toBe(0);
      expect(firstResume.stdout).toContain("Workflow paused.");
      expect(firstResume.stdout).not.toContain("Integration completed.");

      const secondResume = await librettoCli("resume --session default");
      expect(secondResume.exitCode).toBe(0);
      expect(secondResume.stdout).toContain("Integration completed.");
    } finally {
      await librettoCli("close --session default");
    }
  }, 45_000);

  test("fails resume when session is not paused", async ({
    librettoCli,
    seedSessionState,
  }) => {
    await seedSessionState({ session: "default", mode: "interactive" });
    const result = await librettoCli("resume --session default");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Session "default" is not paused.');
  });
});
