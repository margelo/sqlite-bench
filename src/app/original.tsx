import { open as opSQLiteOpen } from "@op-engineering/op-sqlite";
import opPackage from "@op-engineering/op-sqlite/package.json";
import * as Device from "expo-device";
import { openDatabaseSync } from "expo-sqlite";
import expoPackage from "expo-sqlite/package.json";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { open as nitroOpen } from "react-native-nitro-sqlite";
import nitroPackage from "../../node_modules/react-native-nitro-sqlite/package.json";
import { SafeAreaView } from "react-native-safe-area-context";

// The four workloads from the original benchmark screen, with the same row
// count, query count and cooldown. Every library gets the same cooldowns and
// reads every property, and the order of libraries rotates between rounds.
const ITERATIONS = 1000;
const COOL_DOWN_MS = 2500;
const ROUNDS = 3;
const GROUPS = ["sync insert", "async insert", "tx insert", "select + read props"];
const CREATE_TABLE = "CREATE TABLE bench (id INTEGER PRIMARY KEY, name TEXT, value REAL)";
const INSERT = "INSERT INTO bench VALUES (?,?,?)";
const SELECT = "SELECT * FROM bench";

type Row = Record<string, unknown>;
type Timing = { label: string; group: string; ms: number };
type Library = {
  label: string;
  color: string;
  run(): Promise<{ timings: Timing[]; batchAtomicWrite: boolean }>;
};
type Summary = { label: string; group: string; color: string; medianMs: number; samples: number[] };

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function cooldown() {
  // hint at GC by creating and dropping a large allocation
  let _sink: number[] | null = new Array(500_000).fill(0);
  _sink = null;
  await sleep(COOL_DOWN_MS);
}

async function time(label: string, group: string, timings: Timing[], work: () => unknown) {
  await cooldown();
  const start = performance.now();
  await work();
  timings.push({ label, group, ms: performance.now() - start });
}

function readProps(rows: Row[]) {
  for (const row of rows) {
    void row["id"];
    void row["name"];
    void row["value"];
  }
}

function hasBatchAtomicWrite(rows: Row[]) {
  return rows.some((row) => String(row["compile_options"]).startsWith("ENABLE_BATCH_ATOMIC_WRITE"));
}

const opSQLite: Library = {
  label: "op-sqlite",
  color: "#f97316",
  run: async () => {
    const timings: Timing[] = [];
    const db = opSQLiteOpen({ name: "op_bench.db" });
    db.executeSync("DROP TABLE IF EXISTS bench");
    db.executeSync(CREATE_TABLE);

    await time("op-sqlite", "sync insert", timings, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const res = db.executeSync(INSERT, [i, `n${i}`, i * 1.5]);
        void res.insertId;
        void res.rows.length;
      }
    });
    db.executeSync("DELETE FROM bench");

    await time("op-sqlite", "async insert", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const res = await db.execute(INSERT, [i, `n${i}`, i * 1.5]);
        void res.insertId;
        void res.rows.length;
      }
    });
    db.executeSync("DELETE FROM bench");

    await time("op-sqlite", "tx insert", timings, () =>
      db.transaction(async (tx) => {
        for (let i = 0; i < ITERATIONS; i++) {
          await tx.execute(INSERT, [i, `n${i}`, i * 1.5]);
        }
      }),
    );

    await time("op-sqlite", "select + read props", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        readProps((await db.execute(SELECT)).rows);
      }
    });

    await time("op-sqlite (HostObjects)", "select + read props", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        readProps((await db.executeWithHostObjects(SELECT)).rows);
      }
    });

    const batchAtomicWrite = hasBatchAtomicWrite(db.executeSync("PRAGMA compile_options").rows);
    db.executeSync("DROP TABLE IF EXISTS bench");
    db.close();
    return { timings, batchAtomicWrite };
  },
};

const nitroSQLite: Library = {
  label: "nitro-sqlite",
  color: "#a78bfa",
  run: async () => {
    const timings: Timing[] = [];
    const conn = nitroOpen({ name: "nitro_bench.db" });
    conn.execute("DROP TABLE IF EXISTS bench");
    conn.execute(CREATE_TABLE);

    await time("nitro-sqlite", "sync insert", timings, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const res = conn.execute(INSERT, [i, `n${i}`, i * 1.5]);
        void res.insertId;
        void res.rows.length;
      }
    });
    conn.execute("DELETE FROM bench");

    await time("nitro-sqlite", "async insert", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const res = await conn.executeAsync(INSERT, [i, `n${i}`, i * 1.5]);
        void res.insertId;
        void res.rows.length;
      }
    });
    conn.execute("DELETE FROM bench");

    await time("nitro-sqlite", "tx insert", timings, () =>
      conn.transaction(async (tx) => {
        for (let i = 0; i < ITERATIONS; i++) {
          await tx.executeAsync(INSERT, [i, `n${i}`, i * 1.5]);
        }
      }),
    );

    await time("nitro-sqlite", "select + read props", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        readProps((await conn.executeAsync(SELECT)).rows._array);
      }
    });

    const batchAtomicWrite = hasBatchAtomicWrite(conn.execute("PRAGMA compile_options").rows._array);
    conn.execute("DROP TABLE IF EXISTS bench");
    conn.close();
    return { timings, batchAtomicWrite };
  },
};

const expoSQLite: Library = {
  label: "expo-sqlite",
  color: "#34d399",
  run: async () => {
    const timings: Timing[] = [];
    const db = openDatabaseSync("expo_bench.db");
    db.execSync("DROP TABLE IF EXISTS bench");
    db.execSync(CREATE_TABLE);

    await time("expo-sqlite", "sync insert", timings, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        void db.runSync(INSERT, i, `n${i}`, i * 1.5).lastInsertRowId;
      }
    });
    db.execSync("DELETE FROM bench");

    await time("expo-sqlite", "async insert", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        void (await db.runAsync(INSERT, i, `n${i}`, i * 1.5)).lastInsertRowId;
      }
    });
    db.execSync("DELETE FROM bench");

    await time("expo-sqlite", "tx insert", timings, () =>
      db.withExclusiveTransactionAsync(async (txn) => {
        for (let i = 0; i < ITERATIONS; i++) {
          await txn.runAsync(INSERT, i, `n${i}`, i * 1.5);
        }
      }),
    );

    await time("expo-sqlite", "select + read props", timings, async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        readProps(await db.getAllAsync<Row>(SELECT));
      }
    });

    const batchAtomicWrite = hasBatchAtomicWrite(db.getAllSync<Row>("PRAGMA compile_options"));
    db.execSync("DROP TABLE IF EXISTS bench");
    db.closeSync();
    return { timings, batchAtomicWrite };
  },
};

const LIBRARIES = [opSQLite, nitroSQLite, expoSQLite];

function summarize(timings: Timing[]): Summary[] {
  const summaries: Summary[] = [];
  for (const group of GROUPS) {
    const labels = [...new Set(timings.filter((t) => t.group === group).map((t) => t.label))];
    for (const label of labels) {
      const samples = timings.filter((t) => t.group === group && t.label === label).map((t) => t.ms);
      const sorted = [...samples].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      const medianMs = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
      const color = LIBRARIES.find((library) => label.startsWith(library.label))?.color ?? "#ddd";
      summaries.push({ label, group, color, medianMs, samples });
    }
  }
  return summaries;
}

export default function OriginalBenchmarkScreen() {
  const [timings, setTimings] = useState<Timing[]>([]);
  const [batchAtomicWrite, setBatchAtomicWrite] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState("starting…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const all: Timing[] = [];
      const flags: Record<string, boolean> = {};
      try {
        for (let round = 0; round < ROUNDS; round++) {
          const order = LIBRARIES.map((_, i) => LIBRARIES[(i + round) % LIBRARIES.length]);
          for (const library of order) {
            setStatus(`round ${round + 1} of ${ROUNDS}: running ${library.label}…`);
            const result = await library.run();
            all.push(...result.timings);
            flags[library.label] = result.batchAtomicWrite;
            setTimings([...all]);
            setBatchAtomicWrite({ ...flags });
          }
        }
        console.log(`SQLITE_BENCH_ORIGINAL ${JSON.stringify({ ...environment(), batchAtomicWrite: flags, timings: all })}`);
        setStatus("done");
      } catch (e: unknown) {
        setStatus(`error: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
  }, []);

  const summaries = summarize(timings);
  const maxMs = Math.max(...summaries.map((s) => s.medianMs), 1);
  const env = environment();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>SQLite Benchmark</Text>
      <Text style={styles.sub}>
        {ITERATIONS} rows · {COOL_DOWN_MS}ms cooldown between tests · median of {ROUNDS} rounds
      </Text>
      <Text style={styles.meta}>
        {env.build} · {env.platform} {env.osVersion} · {env.model} · op {env.versions.op} · nitro {env.versions.nitro} · expo {env.versions.expo}
      </Text>
      <Text style={styles.meta}>
        F2FS batch atomic write: {LIBRARIES.map((library) => `${library.label} ${label(batchAtomicWrite[library.label])}`).join(" · ")}
      </Text>
      {status !== "done" && <Text style={styles.status}>{status}</Text>}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {GROUPS.map((group) => (
          <View key={group} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{group}</Text>
            </View>
            {summaries
              .filter((s) => s.group === group)
              .map((s) => (
                <View key={s.label} style={styles.barRow}>
                  <View style={styles.barMeta}>
                    <Text style={[styles.label, { color: s.color }]}>{s.label}</Text>
                    <Text style={[styles.ms, { color: s.color }]}>{s.medianMs.toFixed(1)} ms</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(s.medianMs / maxMs) * 100}%` as `${number}%`, backgroundColor: s.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.samples}>{s.samples.map((ms) => ms.toFixed(1)).join(" · ")} ms</Text>
                </View>
              ))}
          </View>
        ))}
        <Text style={styles.footnote}>
          Every library reads id, name and value of every selected row, including op-sqlite&apos;s HostObjects.
          Library order rotates each round.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function label(enabled: boolean | undefined) {
  if (enabled === undefined) return "…";
  return enabled ? "on" : "off";
}

function environment() {
  return {
    build: __DEV__ ? "Debug" : "Release",
    platform: Platform.OS,
    osVersion: Device.osVersion,
    model: Device.modelName,
    isDevice: Device.isDevice,
    versions: { op: opPackage.version, nitro: nitroPackage.version, expo: expoPackage.version },
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", paddingHorizontal: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 16 },
  sub: { fontSize: 13, color: "#888", marginBottom: 4 },
  meta: { fontSize: 11, color: "#777", marginBottom: 2 },
  status: { fontSize: 14, color: "#f0a500", marginVertical: 8 },
  scroll: { flex: 1, marginTop: 8 },
  list: { gap: 16, paddingBottom: 40 },
  section: { gap: 8 },
  sectionHeader: { borderLeftWidth: 3, borderColor: "#777", paddingLeft: 10, marginBottom: 2 },
  sectionTitle: { color: "white", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
  barRow: { gap: 4 },
  barMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  label: { color: "#ddd", fontSize: 12, flexShrink: 1, marginRight: 8 },
  ms: { fontSize: 12, fontWeight: "600", flexShrink: 0 },
  barTrack: { height: 10, backgroundColor: "#1c1c1e", borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  samples: { fontSize: 10, color: "#666" },
  footnote: { fontSize: 11, color: "#555", lineHeight: 16, paddingTop: 8 },
});
