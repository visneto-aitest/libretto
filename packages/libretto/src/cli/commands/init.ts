import { existsSync, mkdirSync, cpSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { z } from "zod";
import { REPO_ROOT } from "../core/context.js";
import { SimpleCLI } from "../framework/simple-cli.js";

function getSkillSourceDir(): string {
	// Resolve relative to this file's location in the package
	const thisDir = dirname(fileURLToPath(import.meta.url));
	// From dist/cli/commands/ -> package root
	const pkgRoot = join(thisDir, "..", "..", "..");
	const skillDir = join(pkgRoot, "skill");
	if (existsSync(skillDir)) return skillDir;
	const skillsDir = join(pkgRoot, "skills");
	if (existsSync(skillsDir)) return skillsDir;
	throw new Error(
		"Could not find skill/ or skills/ directory in the libretto package.",
	);
}

function copySkills(): void {
	const src = getSkillSourceDir();
	const files = readdirSync(src);
	if (files.length === 0) {
		console.log("  No skill files found to copy.");
		return;
	}

	const targets = [
		join(REPO_ROOT, ".agents", "skills", "libretto"),
		join(REPO_ROOT, ".claude", "skills", "libretto"),
	];

	for (const target of targets) {
		mkdirSync(target, { recursive: true });
		cpSync(src, target, { recursive: true });
		console.log(`  \u2713 Copied skill files to ${target}`);
	}
}

function installBrowsers(): void {
	console.log("\nInstalling Playwright Chromium...");
	const result = spawnSync("npx", ["playwright", "install", "chromium"], {
		stdio: "inherit",
		shell: true,
	});
	if (result.status === 0) {
		console.log("  \u2713 Playwright Chromium installed");
	} else {
		console.error(
			"  \u2717 Failed to install Playwright Chromium. Run manually: npx playwright install chromium",
		);
	}
}

function checkSnapshotLLM(): void {
	const hasAnyCreds =
		process.env.GOOGLE_CLOUD_PROJECT ||
		process.env.GCLOUD_PROJECT ||
		process.env.ANTHROPIC_API_KEY ||
		process.env.OPENAI_API_KEY;

	console.log("\nSnapshot LLM configuration:");
	if (hasAnyCreds) {
		console.log("  \u2713 LLM credentials detected");
	} else {
		console.log("  \u2717 No LLM credentials found.");
		console.log("    Set one of the following environment variables:");
		console.log("      GOOGLE_CLOUD_PROJECT  (for Vertex AI / Gemini)");
		console.log("      ANTHROPIC_API_KEY     (for Claude)");
		console.log("      OPENAI_API_KEY        (for GPT)");
		console.log(
			"    Then configure via: npx libretto ai configure <preset>",
		);
	}
}

export const initInput = SimpleCLI.input({
	positionals: [],
	named: {
		skipBrowsers: SimpleCLI.flag({
			name: "skip-browsers",
			help: "Skip Playwright Chromium installation",
		}),
	},
});

export const initCommand = SimpleCLI.command({
	description: "Initialize libretto in the current project",
})
	.input(initInput)
	.handle(async ({ input }) => {
		console.log("Initializing libretto...\n");

		console.log("Copying skill files...");
		try {
			copySkills();
		} catch (err) {
			console.error(
				`  \u2717 ${err instanceof Error ? err.message : String(err)}`,
			);
		}

		if (!input.skipBrowsers) {
			installBrowsers();
		} else {
			console.log("\nSkipping browser installation (--skip-browsers)");
		}

		checkSnapshotLLM();

		console.log("\n\u2713 libretto init complete");
	});
