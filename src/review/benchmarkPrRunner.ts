import { runBenchmarks as runCore, settings as baseSettings, type Settings } from "../benchmark/runner";
import { recordReview } from "./record";

export const settings: Settings = { ...baseSettings, iterations: 50, warmupRounds: 1, measuredRounds: 3, cooldownMs: 50 };

export async function runBenchmarks(onProgress: (status: string) => void, options: Settings = settings) {
  let result = await runCore(onProgress, options);
  await recordReview({ kind: "benchmark-pr", test: "defaults", ...result });
  if (options.mode === "library defaults") {
    result = await runCore(onProgress, { ...options, mode: "normalized WAL/FULL" });
    await recordReview({ kind: "benchmark-pr", test: "normalized", ...result });
  }
  return result;
}
