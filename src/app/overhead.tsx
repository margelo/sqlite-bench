import { open as opOpen } from "@op-engineering/op-sqlite";
import * as Device from "expo-device";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { NitroSQLite, open as nitroOpen } from "react-native-nitro-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { exportRun } from "../benchmark/export";

// Splits Nitro SQLite's per-call cost into its layers. "managed" is the public
// connection API, "native" calls the Nitro object directly and skips the
// JavaScript queue and result wrapper. Each probe reports microseconds per call.
const CALLS = 1000;
const IN_FLIGHT = 250;
const ROUNDS = 5;
const OP_NAME = "probe-op.sqlite";
const NITRO_NAME = "probe-nitro.sqlite";
const INSERT = "INSERT INTO probe VALUES (?,?,?)";
const POINT = "SELECT id, name, value FROM points WHERE id = ?";

type Params = [number, string, number];
type Probe = { group: string; label: string; run: () => Promise<void> | void };
type Result = { group: string; label: string; medianUs: number; samplesUs: number[] };

const params = (i: number): Params => [i, `n${i}`, i * 1.5];

export default function Overhead() {
  const [status, setStatus] = useState("Not started");
  const [results, setResults] = useState<Result[]>([]);

  const start = async () => {
    setResults([]);
    try {
      const measured = await runProbes(setStatus);
      setResults(measured);
      exportRun("overhead", { platform: Platform.OS, osVersion: String(Platform.Version), model: Device.modelName, results: measured });
      setStatus("Done");
    } catch (error) {
      setStatus(`Failed: ${String(error)}`);
    }
  };

  return (
    <SafeAreaView testID="overhead-screen" style={styles.container}>
      <Text style={styles.heading}>Per-call overhead</Text>
      <Text style={styles.sub}>{CALLS} calls ({IN_FLIGHT} in flight) · 1 warmup + {ROUNDS} rounds · median µs per call</Text>
      <Pressable testID="run-probe" onPress={start} style={styles.button}><Text style={styles.buttonText}>Run probe</Text></Pressable>
      <Text testID="probe-status" style={styles.status}>{status}</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {results.map((result) => (
          <Text key={`${result.group}/${result.label}`} style={styles.row}>
            {result.group} · {result.label}: <Text style={styles.value}>{result.medianUs.toFixed(1)} µs</Text>
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

async function runProbes(setStatus: (status: string) => void): Promise<Result[]> {
  const op = opOpen({ name: OP_NAME });
  const nitro = nitroOpen({ name: NITRO_NAME });
  const native = NitroSQLite.native;
  try {
    const setups: ((sql: string, p?: Params) => unknown)[] = [(sql, p) => op.executeSync(sql, p), (sql, p) => nitro.execute(sql, p)];
    for (const db of setups) {
      db("DROP TABLE IF EXISTS probe");
      db("CREATE TABLE probe (id INTEGER PRIMARY KEY, name TEXT, value REAL)");
      db("DROP TABLE IF EXISTS points");
      db("CREATE TABLE points (id INTEGER PRIMARY KEY, name TEXT, value REAL)");
      db("BEGIN");
      for (let i = 0; i < CALLS; i++) db("INSERT INTO points VALUES (?,?,?)", params(i));
      db("COMMIT");
    }
    const prepared = nitro.prepare(INSERT);
    const noRows = () => {};

    const probes: Probe[] = [
      insertProbe("op executeSync", (p) => op.executeSync(INSERT, p), op.executeSync.bind(op)),
      insertProbe("nitro managed execute", (p) => nitro.execute(INSERT, p), nitro.execute),
      insertProbe("nitro native.execute", (p) => native.execute(NITRO_NAME, INSERT, p), nitro.execute),
      insertProbe("nitro prepared execute", (p) => prepared.execute(p), nitro.execute),
      { group: "sync point read", label: "op executeSync", run: () => { for (let i = 0; i < CALLS; i++) touch(op.executeSync(POINT, [i]).rows[0]); } },
      { group: "sync point read", label: "nitro managed execute", run: () => { for (let i = 0; i < CALLS; i++) touch(nitro.execute(POINT, [i]).rows._array[0]); } },
      { group: "sync point read", label: "nitro native.execute", run: () => { for (let i = 0; i < CALLS; i++) touch(native.execute(NITRO_NAME, POINT, [i]).results[0]); } },
      { group: "async point read", label: "op execute", run: async () => { for (let i = 0; i < CALLS; i++) touch((await op.execute(POINT, [i])).rows[0]); } },
      { group: "async point read", label: "nitro managed executeAsync", run: async () => { for (let i = 0; i < CALLS; i++) touch((await nitro.executeAsync(POINT, [i])).rows._array[0]); } },
      { group: "async point read", label: "nitro native.executeAsync", run: async () => { for (let i = 0; i < CALLS; i++) touch((await native.executeAsync(NITRO_NAME, POINT, [i])).results[0]); } },
      { group: "async point read", label: "nitro native.executeAsync + onRows", run: async () => { for (let i = 0; i < CALLS; i++) touch((await native.executeAsync(NITRO_NAME, POINT, [i], noRows)).results[0]); } },
      { group: "point reads in flight", label: "op execute", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => op.execute(POINT, [i])))).forEach((r) => touch(r.rows[0])); } },
      { group: "point reads in flight", label: "nitro managed executeAsync", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => nitro.executeAsync(POINT, [i])))).forEach((r) => touch(r.rows._array[0])); } },
      { group: "point reads in flight", label: "nitro native.executeAsync", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => native.executeAsync(NITRO_NAME, POINT, [i])))).forEach((r) => touch(r.results[0])); } },
      { group: "point reads in flight", label: "nitro native.executeAsync + onRows", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => native.executeAsync(NITRO_NAME, POINT, [i], noRows)))).forEach((r) => touch(r.results[0])); } },
      { group: "point reads in flight", label: "op executeRaw", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => op.executeRaw(POINT, [i])))).forEach((r) => touchRaw(r.rawRows[0])); } },
      { group: "point reads in flight", label: "nitro native.executeRawAsync", run: async () => { (await Promise.all(range(IN_FLIGHT).map((i) => native.executeRawAsync(NITRO_NAME, POINT, [i])))).forEach((r) => touchRaw(r.rows[0])); } },
      batchProbe("op executeBatch", async (rows) => { await op.executeBatch([[INSERT, rows]]); }, op.executeSync.bind(op)),
      batchProbe("nitro managed executeBatchAsync", async (rows) => { await nitro.executeBatchAsync([{ query: INSERT, params: rows }]); }, nitro.execute),
      batchProbe("nitro native.executeBatchAsync", async (rows) => { await native.executeBatchAsync(NITRO_NAME, [{ query: INSERT, params: rows }]); }, nitro.execute),
    ];

    const samples = new Map<Probe, number[]>(probes.map((probe) => [probe, []]));
    for (let round = 0; round <= ROUNDS; round++) {
      // Rotate the order so no probe always runs first.
      const ordered = probes.map((_, i) => probes[(i + round) % probes.length]);
      for (const probe of ordered) {
        setStatus(`${round === 0 ? "warmup" : `round ${round} of ${ROUNDS}`} · ${probe.group} · ${probe.label}`);
        await new Promise((resolve) => setTimeout(resolve, 50));
        const started = performance.now();
        await probe.run();
        const elapsed = performance.now() - started;
        const calls = probe.group === "point reads in flight" ? IN_FLIGHT : CALLS;
        if (round > 0) samples.get(probe)!.push((elapsed * 1000) / calls);
      }
    }
    prepared.finalize();
    return probes.map((probe) => {
      const values = samples.get(probe)!;
      return { group: probe.group, label: probe.label, medianUs: median(values), samplesUs: values };
    });
  } finally {
    op.close();
    nitro.close();
  }
}

// Inserts run inside one transaction, so each sample covers 1,000 inserts and one commit.
function insertProbe(label: string, insert: (p: Params) => unknown, exec: (sql: string) => unknown): Probe {
  return {
    group: "sync insert in transaction",
    label,
    run: () => {
      exec("DELETE FROM probe");
      exec("BEGIN");
      try {
        for (let i = 0; i < CALLS; i++) insert(params(i));
      } finally {
        exec("COMMIT");
      }
    },
  };
}

function batchProbe(label: string, batch: (rows: Params[]) => Promise<void>, exec: (sql: string) => unknown): Probe {
  return {
    group: "async batch insert",
    label,
    run: async () => {
      exec("DELETE FROM probe");
      await batch(range(CALLS).map(params));
    },
  };
}

function touch(row: Record<string, unknown> | undefined) {
  if (!row || row.id === undefined || row.name === undefined || row.value === undefined) throw new Error("Missing point row");
}

function touchRaw(row: unknown[] | undefined) {
  if (!row || row.length !== 3) throw new Error("Missing raw point row");
}

function range(count: number) {
  return Array.from({ length: count }, (_, i) => i);
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", paddingHorizontal: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 16 },
  sub: { fontSize: 13, color: "#888", marginBottom: 8 },
  button: { borderWidth: 1, borderColor: "#555", borderRadius: 8, padding: 10, alignSelf: "flex-start" },
  buttonText: { color: "#fff" },
  status: { fontSize: 14, color: "#f0a500", marginVertical: 8 },
  scroll: { flex: 1 },
  list: { gap: 6, paddingBottom: 40 },
  row: { color: "#ddd", fontSize: 12 },
  value: { color: "#fff", fontWeight: "600" },
});
