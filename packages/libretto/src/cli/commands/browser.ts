import type { Argv } from "yargs";
import type { LoggerApi } from "../../shared/logger/index.js";
import { z } from "zod";
import {
  runClose as runCloseWithLogger,
  runCloseAll as runCloseAllWithLogger,
  runOpen,
  runPages,
  runSave,
} from "../core/browser.js";
import { withSessionLogger } from "../core/context.js";
import { SESSION_DEFAULT, validateSessionName } from "../core/session.js";
import { SimpleCLI } from "../framework/simple-cli.js";

function createSessionSchema() {
  return z.string().default(SESSION_DEFAULT).superRefine((value, ctx) => {
    try {
      validateSessionName(value);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

export const openInput = SimpleCLI.input({
  positionals: [
    SimpleCLI.positional("url", z.string().optional(), {
      help: "URL to open",
    }),
  ],
  named: {
    session: SimpleCLI.option(createSessionSchema(), {
      help: "Use a named session",
    }),
    headed: SimpleCLI.flag({ help: "Run browser in headed mode" }),
    headless: SimpleCLI.flag({ help: "Run browser in headless mode" }),
  },
}).refine((input) => !(input.headed && input.headless), "Cannot pass both --headed and --headless.");

export function createOpenCommand(logger: LoggerApi) {
  return SimpleCLI.command({
    description: "Launch browser and open URL (headed by default)",
  })
    .input(openInput)
    .handle(async ({ input }) => {
      if (!input.url) {
        throw new Error(
          "Usage: libretto-cli open <url> [--headless] [--session <name>]",
        );
      }

      const headed = input.headed || !input.headless;
      await runOpen(input.url, headed, input.session, logger);
    });
}

export function registerBrowserCommands(yargs: Argv, logger: LoggerApi): Argv {
  return yargs
    .command(
      "save [urlOrDomain]",
      "Save current browser session",
      (cmd) => cmd,
      async (argv) => {
        const urlOrDomain = argv.urlOrDomain as string | undefined;
        if (!urlOrDomain) {
          throw new Error("Usage: libretto-cli save <url|domain> [--session <name>]");
        }
        await runSave(urlOrDomain, String(argv.session), logger);
      },
    )
    .command("pages", "List open pages in the session", (cmd) => cmd, async (argv) => {
      await runPages(String(argv.session), logger);
    })
    .command(
      "close",
      "Close the browser",
      (cmd) =>
        cmd
          .option("all", {
            type: "boolean",
            default: false,
            describe: "Close all tracked sessions in this workspace",
          })
          .option("force", {
            type: "boolean",
            default: false,
            describe: "Force kill sessions that ignore SIGTERM (requires --all)",
          }),
      async (argv) => {
        const closeAll = Boolean(argv.all);
        const force = Boolean(argv.force);
        if (force && !closeAll) {
          throw new Error("Usage: libretto-cli close --all [--force]");
        }
        if (closeAll) {
          await runCloseAllWithLogger(logger, { force });
          return;
        }
        await runCloseWithLogger(String(argv.session), logger);
      },
    );
}

export async function runClose(session: string): Promise<void> {
  await withSessionLogger(session, async (logger) => {
    await runCloseWithLogger(session, logger);
  });
}
