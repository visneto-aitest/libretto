import type { Page } from "playwright";
import type { MinimalLogger } from "../logger/logger.js";

export const LIBRETTO_WORKFLOW_BRAND = Symbol.for("libretto.workflow");

// Task 9.5: Add credentials to context
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

// Task 9.3: Module-level global registry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, LibrettoWorkflow<any, any, any>>();

export class LibrettoWorkflow<Input = unknown, Output = unknown, S = {}> {
  public readonly [LIBRETTO_WORKFLOW_BRAND] = true;
  // Task 9.2: name property set in constructor
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

// Task 9.4: Exported _getRegistry() function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function _getRegistry(): Map<string, LibrettoWorkflow<any, any, any>> {
  return registry;
}

// Task 9.1: Add name as first argument
export function workflow<Input = unknown, Output = unknown, S = {}>(
  name: string,
  handler: LibrettoWorkflowHandler<Input, Output, S>,
): LibrettoWorkflow<Input, Output, S> {
  if (registry.has(name)) {
    throw new Error(
      `Duplicate workflow name: "${name}". Each workflow() call must use a unique name.`,
    );
  }
  const instance = new LibrettoWorkflow(name, handler);
  registry.set(name, instance);
  return instance;
}
