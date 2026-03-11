#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliRoot = join(__dirname, "..");
const distEntry = join(cliRoot, "dist", "cli", "index.js");

if (!existsSync(distEntry)) {
  // Build from the package root (builds runtime then CLI in order).
  console.error("[libretto] dist not found, building...");
  execSync("pnpm build", { cwd: cliRoot, stdio: "inherit" });
}

await import(distEntry);
