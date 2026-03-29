import { describe, expect, it } from "vitest";
import {
  getWorkflowsFromModuleExports,
  workflow,
  type LibrettoWorkflowContext,
} from "../src/index.js";

describe("workflow services", () => {
  it("merges default services with per-run overrides", async () => {
    const main = workflow
      .withServices({ provider: "default", retries: 1 })
      ("main", async (ctx) => ctx.services);

    const result = await main.run(
      {
        session: "test-session",
        page: {} as LibrettoWorkflowContext["page"],
        logger: { info() {}, error() {}, warn() {} },
        services: { retries: 3 },
      },
      undefined,
    );

    expect(result).toEqual({ provider: "default", retries: 3 });
  });

  it("returns a branded workflow object that module discovery can find", () => {
    const main = workflow.withServices({ provider: "default" })(
      "main",
      async () => "ok",
    );

    expect(getWorkflowsFromModuleExports({ main })).toEqual([main]);
  });
});
