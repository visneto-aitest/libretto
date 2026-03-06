import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";
import { LIBRETTO_CONFIG_PATH } from "./context";

export const CURRENT_CONFIG_VERSION = 1;

export const AiPresetSchema = z.enum(["codex", "opencode", "claude", "gemini"]);
export type AiPreset = z.infer<typeof AiPresetSchema>;

export const AiConfigSchema = z
  .object({
    preset: AiPresetSchema,
    commandPrefix: z.array(z.string()).min(1),
    updatedAt: z.string(),
  })
  .strict();
export type AiConfig = z.infer<typeof AiConfigSchema>;

export const LibrettoConfigSchema = z
  .object({
    version: z.literal(CURRENT_CONFIG_VERSION),
    ai: AiConfigSchema.optional(),
  })
  .strict();
export type LibrettoConfig = z.infer<typeof LibrettoConfigSchema>;

function invalidConfigError(configPath: string): Error {
  return new Error(
    `AI config is invalid at ${configPath}. Fix the file to match the expected schema or delete it.`,
  );
}

function parseConfig(raw: string, configPath: string): LibrettoConfig {
  try {
    return LibrettoConfigSchema.parse(JSON.parse(raw));
  } catch {
    throw invalidConfigError(configPath);
  }
}

export function readLibrettoConfig(
  configPath: string = LIBRETTO_CONFIG_PATH,
): LibrettoConfig {
  if (!existsSync(configPath)) {
    return { version: CURRENT_CONFIG_VERSION };
  }
  return parseConfig(readFileSync(configPath, "utf-8"), configPath);
}

export function writeLibrettoConfig(
  config: LibrettoConfig,
  configPath: string = LIBRETTO_CONFIG_PATH,
): LibrettoConfig {
  const parsed = LibrettoConfigSchema.parse(config);
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(parsed, null, 2), "utf-8");
  return parsed;
}

export function readAiConfig(configPath: string = LIBRETTO_CONFIG_PATH): AiConfig | null {
  return readLibrettoConfig(configPath).ai ?? null;
}
