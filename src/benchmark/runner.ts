import { adapters } from "./adapters";
import { cases } from "./cases";
import { configure, databaseName, makeManifest, message, type Mode } from "./metadata";
import { summarize } from "./statistics";
import { unsupportedReason } from "./support";
import type { Adapter, Case, Connection, Failure, Sample, Skipped } from "./types";

export type Settings = { iterations: number; warmupRounds: number; measuredRounds: number; cooldownMs: number; mode: Mode };
export const settings: Settings = { iterations: 250, warmupRounds: 1, measuredRounds: 3, cooldownMs: 2500, mode: "library defaults" };

export async function runBenchmarks(onProgress: (status: string) => void, options: Settings = settings) {
  const manifest = await makeManifest(adapters, options);
  const samples: Sample[] = [];
  const failures: Failure[] = [];
  const skipped: Skipped[] = [];
  const totalRounds = options.warmupRounds + options.measuredRounds;
  // SQLite deletes a WAL file when its last connection closes, so a fresh connection per
  // sample would make every commit grow a new WAL. op-sqlite's close() keeps the handle
  // open while statements are unfinalized, which kept only its WAL alive. In WAL mode
  // each library keeps one connection for the run, like an app that keeps its database open.
  const shared = options.mode === "normalized WAL/FULL"
    ? new Map(adapters.map((adapter) => [adapter.id, adapter.open(databaseName(adapter.id, options.mode))]))
    : undefined;

  try {
    for (let round = 0; round < totalRounds; round++) {
      for (let caseIndex = 0; caseIndex < cases.length; caseIndex++) {
        const benchmarkCase = cases[caseIndex];
        const eligible = rotate(adapters.filter((adapter) => benchmarkCase.libraries.includes(adapter.id)), round + caseIndex);
        for (const adapter of eligible) {
          const reason = unsupportedReason(options.mode, adapter.id, benchmarkCase.id);
          if (reason) {
            if (!skipped.some((entry) => entry.library === adapter.id && entry.caseId === benchmarkCase.id)) {
              skipped.push({ library: adapter.id, caseId: benchmarkCase.id, reason });
            }
            continue;
          }
          onProgress(`${round < options.warmupRounds ? "warmup" : `round ${round}`} · ${benchmarkCase.label} · ${adapter.label}`);
          try {
            const sample = await runOne(adapter, benchmarkCase, round, options, shared?.get(adapter.id));
            if (round >= options.warmupRounds) samples.push(sample);
          } catch (error) {
            failures.push({ library: adapter.id, caseId: benchmarkCase.id, round, message: message(error) });
          }
        }
      }
    }
  } finally {
    shared?.forEach((db) => db.close());
  }
  if (skipped.length) manifest.warnings.push(`${skipped.length} unsupported workload combination(s) were omitted; see skipped cases.`);
  return { manifest, samples, summaries: summarize(samples, failures), failures, skipped };
}

async function runOne(adapter: Adapter, benchmarkCase: Case, round: number, options: Settings, shared?: Connection): Promise<Sample> {
  const db = shared ?? adapter.open(databaseName(adapter.id, options.mode));
  const workload = benchmarkCase.create();
  try {
    configure(db, options.mode);
    await workload.setup(db, options.iterations);
    await sleep(options.cooldownMs);
    const start = performance.now();
    const checksum = await workload.run(db, options.iterations);
    const elapsed = performance.now() - start;
    const ms = workload.reportedMs?.() ?? elapsed;
    await workload.check(db, options.iterations, checksum);
    return { library: adapter.id, caseId: benchmarkCase.id, round, ms, checksum };
  } finally {
    try {
      await workload.teardown(db);
    } finally {
      if (!shared) db.close();
    }
  }
}

function rotate<T>(items: T[], offset: number): T[] {
  if (items.length === 0) return [];
  const index = offset % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
