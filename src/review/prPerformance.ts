import { open } from "react-native-nitro-sqlite";
import { recordReview } from "./record";

export async function runPrPerformance() {
  const db = open({ name: "review_pr_performance.db" });
  const inputs = Array.from({ length: 10000 }, (_, id) => [id, `n${id}`, id * 1.5]);
  const insert = "INSERT INTO bench VALUES (?, ?, ?)";
  const full = "SELECT * FROM bench";
  const cases = ["read-all", "prepared-read-all", "batch-1000", "batch-10000"];
  try {
    for (const sql of ["PRAGMA journal_mode=WAL", "PRAGMA synchronous=FULL", "PRAGMA cache_size=-2000", "PRAGMA temp_store=MEMORY", "DROP TABLE IF EXISTS bench", "CREATE TABLE bench (id INTEGER PRIMARY KEY, name TEXT, value REAL)"]) db.execute(sql);
    const prepared = db.prepare(full);
    try {
      for (let round = 0; round < 6; round++) {
        for (let position = 0; position < cases.length; position++) {
          const test = cases[(position + round) % cases.length];
          db.execute("DELETE FROM bench");
          if (test.includes("read")) db.executeBatch([{ query: insert, params: inputs.slice(0, 1000) }]);
          const params = inputs.slice(0, test === "batch-10000" ? 10000 : 1000);
          await new Promise<void>((resolve) => setTimeout(resolve, 350));
          const start = performance.now();
          let checksum = 0;
          if (test.includes("read")) {
            for (let i = 0; i < 250; i++) {
              const result = test === "read-all" ? await db.executeAsync(full) : await prepared.executeAsync();
              for (const row of result.rows._array) {
                if (typeof row.id !== "number" || typeof row.value !== "number" || typeof row.name !== "string") throw new Error("Invalid row");
                checksum += row.id + row.value + row.name.length;
              }
            }
          } else {
            const result = await db.executeBatchAsync([{ query: insert, params }]);
            if (result.rowsAffected !== params.length) throw new Error("Wrong affected count");
          }
          const ms = performance.now() - start;
          const count = db.execute("SELECT count(*) AS value FROM bench").rows.item(0)?.value;
          if (count !== params.length) throw new Error("Wrong inserted count");
          if (test.includes("read") && checksum !== 1252640 * 250) throw new Error("Wrong checksum");
          await recordReview({ kind: "pr-performance", round, position, warmup: round === 0, library: "nitro-sqlite", test, ms, checksum, count });
        }
      }
    } finally { prepared.finalize(); }
  } finally { db.close(); }
}
