import type { Page } from "playwright";
import type { MinimalLogger } from "../logger/logger.js";

export const LIBRETTO_WORKFLOW_BRAND = Symbol.for("libretto.workflow");

export type LibrettoWorkflowContext<S = {}> = {
  session: string;
  page: Page;
  logger: MinimalLogger;
  services: S;
  credentials?: Record<string, unknown>;
};

export type LibrettoWorkflowHandler<
  Input = unknown,
  Output = unknown,
  S = {},
> = (ctx: LibrettoWorkflowContext<S>, input: Input) => Promise<Output>;

export class LibrettoWorkflow<Input = unknown, Output = unknown, S = {}> {
  public readonly [LIBRETTO_WORKFLOW_BRAND] = true;
  public readonly name: string;
  private readonly handler: LibrettoWorkflowHandler<Input, Output, S>;

  constructor(name: string, handler: LibrettoWorkflowHandler<Input, Output, S>) {
    this.name = name;
    this.handler = handler;
  }

  async run(ctx: LibrettoWorkflowContext<S>, input: Input): Promise<Output> {
    return this.handler(ctx, input);
  }
}

export type ExportedLibrettoWorkflow = {
  readonly [LIBRETTO_WORKFLOW_BRAND]: true;
  readonly name: string;
  run: (ctx: LibrettoWorkflowContext, input: unknown) => Promise<unknown>;
};

type WorkflowModuleExports = Record<string, unknown>;

export function isLibrettoWorkflow(
  value: unknown,
): value is ExportedLibrettoWorkflow {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<PropertyKey, unknown>;
  return (
    candidate[LIBRETTO_WORKFLOW_BRAND] === true &&
    typeof candidate.name === "string" &&
    typeof candidate.run === "function"
  );
}

function addWorkflowOrThrow(
  workflowsByName: Map<string, ExportedLibrettoWorkflow>,
  value: unknown,
): void {
  if (!isLibrettoWorkflow(value)) return;

  const existing = workflowsByName.get(value.name);
  if (existing && existing !== value) {
    throw new Error(
      `Duplicate workflow name: "${value.name}". Each workflow() call must use a unique name.`,
    );
  }

  workflowsByName.set(value.name, value);
}

export function getWorkflowsFromModuleExports(
  moduleExports: WorkflowModuleExports,
): ExportedLibrettoWorkflow[] {
  const workflowsByName = new Map<string, ExportedLibrettoWorkflow>();

  for (const [exportName, value] of Object.entries(moduleExports)) {
    if (exportName === "workflows" && value && typeof value === "object") {
      for (const nestedValue of Object.values(value as Record<string, unknown>)) {
        addWorkflowOrThrow(workflowsByName, nestedValue);
      }
      continue;
    }

    addWorkflowOrThrow(workflowsByName, value);
  }

  return [...workflowsByName.values()];
}

export function getWorkflowFromModuleExports(
  moduleExports: WorkflowModuleExports,
  workflowName: string,
): ExportedLibrettoWorkflow | null {
  for (const workflow of getWorkflowsFromModuleExports(moduleExports)) {
    if (workflow.name === workflowName) {
      return workflow;
    }
  }
  return null;
}

export function workflow<Input = unknown, Output = unknown, S = {}>(
  name: string,
  handler: LibrettoWorkflowHandler<Input, Output, S>,
): LibrettoWorkflow<Input, Output, S> {
  return new LibrettoWorkflow(name, handler);
}
