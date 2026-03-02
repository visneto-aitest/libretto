// Step runner
export { step } from "./step/step.js";
export { createRunner, type Runner } from "./step/runner.js";
export type {
	Step,
	StepOptions,
	StepContext,
	StepHandler,
	RecoveryHandler,
	RunnerConfig,
	StepHistoryEntry,
	DebugBundle,
} from "./step/types.js";

// Logger
export { Logger, type LoggerApi, type LoggerSink, type LogOptions } from "./logger/logger.js";
export {
	createFileLogSink,
	prettyConsoleSink,
	jsonlConsoleSink,
} from "./logger/sinks.js";

// LLM client interface
export type { LLMClient, Message, MessageContentPart } from "./llm/types.js";

// Recovery
export { executeRecoveryAgent } from "./recovery/agent.js";
export { attemptWithRecovery } from "./recovery/recovery.js";
export {
	detectSubmissionError,
	type KnownSubmissionError,
	type DetectedSubmissionError,
} from "./recovery/errors.js";

// AI extraction
export { extractFromPage, type ExtractOptions } from "./extract/extract.js";

// Network helpers
export {
	pageRequest,
	type RequestConfig,
	type PageRequestOptions,
} from "./network/network.js";

// Debug
export { debugPause, type DebugPauseOptions } from "./debug/pause.js";

// Config
export {
	isDebugMode,
	isDryRun,
	shouldPauseBeforeMutation,
	setDebugMode,
	setDryRun,
} from "./config/config.js";
