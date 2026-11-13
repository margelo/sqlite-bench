import { open as openOp } from "@op-engineering/op-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { open } from "react-native-nitro-sqlite";
import { recordReview } from "./record";

export async function runPrIsolation() {
  const nitro = open({ name: "isolation_nitro.db" });
  const op = openOp({ name: "isolation_op.db" });
  const expo = openDatabaseSync("isolation_expo.db");
  try {
    const query = "SELECT sqlite_version() AS version, sqlite_source_id() AS source";
    const engines = [
      { library: "nitro-sqlite", ...nitro.execute(query).rows.item(0), options: nitro.execute("PRAGMA compile_options").rows._array },
      { library: "op-sqlite", ...op.executeSync(query).rows[0], options: op.executeSync("PRAGMA compile_options").rows },
      { library: "expo-sqlite", ...expo.getAllSync(query)[0], options: expo.getAllSync("PRAGMA compile_options") },
    ];
    const [n, o] = engines as { library: string; version: string; source: string; options: unknown[] }[];
    await recordReview({ kind: "pr-isolation", engines, privateVersionCorrect: n.version === "3.49.0", nitroAndOpDistinct: n.source !== o.source });
  } finally { nitro.close(); op.close(); expo.closeSync(); }
}
