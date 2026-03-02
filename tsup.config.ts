import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: {
			index: "src/index.ts",
			"step/index": "src/step/index.ts",
			"logger/index": "src/logger/index.ts",
			"recovery/index": "src/recovery/index.ts",
			"extract/index": "src/extract/index.ts",
			"network/index": "src/network/index.ts",
			"debug/index": "src/debug/index.ts",
			"config/index": "src/config/index.ts",
		},
		format: ["esm", "cjs"],
		dts: true,
		splitting: true,
		clean: true,
		outDir: "dist",
	},
	{
		entry: {
			"cli/index": "cli/index.ts",
		},
		format: ["esm"],
		dts: false,
		banner: {
			js: "#!/usr/bin/env node",
		},
		outDir: "dist",
	},
]);
