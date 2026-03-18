#!/usr/bin/env node

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SKILL_DIRS, syncRepoSkills } from "./skills-libretto.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

syncRepoSkills(repoRoot);

for (const dir of SKILL_DIRS.slice(1)) {
  console.log(`libretto: synced skills/libretto -> ${dir}`);
}
