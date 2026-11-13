import { open as openOp } from "@op-engineering/op-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { open as openNitro } from "react-native-nitro-sqlite";
import { recordReview } from "./record";

type Params = (number | string)[];
type Rows = Record<string, unknown>[];
type Prepared = {
  read(params: Params): Promise<Rows>;
  run(params: Params): Promise<void>;
  dispose(): void;
  runSync?: (params: Params) => void;
};
type Adapter = {
  name: string;
  read(sql: string, params?: Params): Promise<Rows>;
  readSync(sql: string, params?: Params): Rows;
  run(sql: string, params?: Params): Promise<void>;
  runSync(sql: string, params?: Params): void;
  prepare?: (sql: string) => Prepared;
  batch?: (params: Params[]) => Promise<void>;
  hosts?: () => Promise<Rows>;
  close(): void;
};
const count = 1000;
const readRepeats = 250;
const insert = "INSERT INTO bench VALUES (?,?,?)";
const select = "SELECT * FROM bench";
const point = "SELECT * FROM bench WHERE id = ?";
const values: Params[] = Array.from({ length: count }, (_, i) => [i, `n${i}`, i * 1.5]);
const expected = 1252640;

export async function runDiagnostics() {
  const factories = [createOp, createNitro, createExpo];
  for (let round = 0; round < 4; round++) {
    for (let position = 0; position < factories.length; position++) {
      const db = factories[(position + round) % factories.length]();
      try {
        const defaults = getSettings(db);
        db.runSync("PRAGMA journal_mode=WAL");
        db.runSync("PRAGMA synchronous=FULL");
        db.runSync("PRAGMA cache_size=-2000");
        db.runSync("PRAGMA temp_store=MEMORY");
        db.runSync("DROP TABLE IF EXISTS bench");
        db.runSync("CREATE TABLE bench (id INTEGER PRIMARY KEY, name TEXT, value REAL)");
        const results: { test: string; ms: number; checksum?: number }[] = [];
        const measure = async (test: string, action: () => Promise<number | void>) => {
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
          const start = performance.now();
          const checksum = await action();
          results.push({ test, ms: performance.now() - start, ...(typeof checksum === "number" ? { checksum } : {}) });
        };
        await measure("tx-sync-1000", async () => {
          db.runSync("BEGIN");
          for (const params of values) db.runSync(insert, params);
          db.runSync("COMMIT");
        });
        assertSeed(db);
        await measure("select-all-250-checksum", async () => {
          let checksum = 0;
          for (let i = 0; i < readRepeats; i++) checksum += consume(await db.read(select));
          assertEqual(checksum, expected * readRepeats);
          return checksum;
        });
        if (db.hosts) {
          await measure("select-hosts-250-checksum", async () => {
            let checksum = 0;
            for (let i = 0; i < readRepeats; i++) checksum += consume(await db.hosts!());
            assertEqual(checksum, expected * readRepeats);
            return checksum;
          });
        }
        await measure("select-point-1000-checksum", async () => {
          let checksum = 0;
          for (let i = 0; i < count; i++) checksum += consume(await db.read(point, [i]));
          assertEqual(checksum, expected);
          return checksum;
        });
        if (db.prepare) {
          const all = db.prepare(select);
          const single = db.prepare(point);
          try {
            await measure("prepared-all-250-checksum", async () => {
              let checksum = 0;
              for (let i = 0; i < readRepeats; i++) checksum += consume(await all.read([]));
              assertEqual(checksum, expected * readRepeats);
              return checksum;
            });
            await measure("prepared-point-1000-checksum", async () => {
              let checksum = 0;
              for (let i = 0; i < count; i++) checksum += consume(await single.read([i]));
              assertEqual(checksum, expected);
              return checksum;
            });
          } finally { all.dispose(); single.dispose(); }
        }
        if (db.prepare) {
          db.runSync("DELETE FROM bench");
          const syncStatement = db.prepare(insert);
          try {
            if (syncStatement.runSync) {
              await measure("tx-prepared-sync-1000", async () => {
                db.runSync("BEGIN");
                for (const params of values) syncStatement.runSync!(params);
                db.runSync("COMMIT");
              });
              assertSeed(db);
            }
          } finally { syncStatement.dispose(); }
        }
        db.runSync("DELETE FROM bench");
        await measure("tx-async-1000", async () => {
          await db.run("BEGIN");
          for (const params of values) await db.run(insert, params);
          await db.run("COMMIT");
        });
        assertSeed(db);
        if (db.prepare) {
          db.runSync("DELETE FROM bench");
          const statement = db.prepare(insert);
          try {
            await measure("tx-prepared-async-1000", async () => {
              await db.run("BEGIN");
              for (const params of values) await statement.run(params);
              await db.run("COMMIT");
            });
            assertSeed(db);
          } finally { statement.dispose(); }
        }
        if (db.batch) {
          db.runSync("DELETE FROM bench");
          await measure("batch-1000", () => db.batch!(values));
          assertSeed(db);
        }
        await recordReview({ kind: "diagnostic", round, warmup: round === 0, position,
          library: db.name, correctness: checkSpecialValues(db), settings: getSettings(db), defaults, results });
      } finally { db.close(); }
    }
  }
}

function createOp(): Adapter {
  const db = openOp({ name: "review_op.db" });
  return {
    name: "op-sqlite", read: async (sql, params) => (await db.execute(sql, params)).rows,
    readSync: (sql, params) => db.executeSync(sql, params).rows,
    run: async (sql, params) => { await db.execute(sql, params); },
    runSync: (sql, params) => { db.executeSync(sql, params); },
    hosts: async () => (await db.executeWithHostObjects(select)).rows,
    batch: async (params) => { await db.executeBatch([[insert, params]]); },
    prepare: (sql) => {
      let statement: ReturnType<typeof db.prepareStatement> | undefined = db.prepareStatement(sql);
      return {
        read: async (params) => {
          if (!statement) throw new Error("Statement disposed");
          statement.bindSync(params);
          return (await statement.execute()).rows;
        },
        run: async (params) => {
          if (!statement) throw new Error("Statement disposed");
          statement.bindSync(params);
          await statement.execute();
        },
        runSync: (params) => {
          if (!statement) throw new Error("Statement disposed");
          statement.bindSync(params);
          statement.executeSync();
        },
        dispose: () => { statement = undefined; },
      };
    }, close: () => db.close(),
  };
}

function createNitro(): Adapter {
  const db = openNitro({ name: "review_nitro.db" });
  // This runner deliberately supports both the published release and main.
  type NativePrepared = {
    executeAsync(params: Params): Promise<{ rows: { _array: Rows } }>;
    execute(params: Params): { rows: { _array: Rows } };
    finalize(): void;
  };
  const candidate = db as typeof db & { prepare?: (sql: string) => NativePrepared };
  return {
    name: "nitro-sqlite", read: async (sql, params) => (await db.executeAsync(sql, params)).rows._array,
    readSync: (sql, params) => db.execute(sql, params).rows._array,
    run: async (sql, params) => { await db.executeAsync(sql, params); },
    runSync: (sql, params) => { db.execute(sql, params); },
    batch: async (params) => { await db.executeBatchAsync([{ query: insert, params }]); },
    ...(candidate.prepare ? { prepare: (sql: string): Prepared => {
      const statement = candidate.prepare!(sql);
      return {
        read: async (params) => (await statement.executeAsync(params)).rows._array,
        run: async (params) => { await statement.executeAsync(params); },
        runSync: (params) => { statement.execute(params); },
        dispose: () => statement.finalize(),
      };
    } } : {}), close: () => db.close(),
  };
}

function createExpo(): Adapter {
  const db = openDatabaseSync("review_expo.db");
  return {
    name: "expo-sqlite", read: (sql, params = []) => db.getAllAsync(sql, params),
    readSync: (sql, params = []) => db.getAllSync(sql, params),
    run: async (sql, params = []) => { await db.runAsync(sql, params); },
    runSync: (sql, params = []) => { db.runSync(sql, params); },
    prepare: (sql) => {
      const statement = db.prepareSync(sql);
      return {
        read: async (params) => (await statement.executeAsync<Record<string, unknown>>(params)).getAllAsync(),
        run: async (params) => { await statement.executeAsync(params); },
        runSync: (params) => { statement.executeSync(params); },
        dispose: () => statement.finalizeSync(),
      };
    }, close: () => db.closeSync(),
  };
}

function getSettings(db: Adapter) {
  const settings: Record<string, unknown> = { version: db.readSync("SELECT sqlite_version() AS version, sqlite_source_id() AS source") };
  for (const pragma of ["compile_options", "journal_mode", "synchronous", "page_size", "cache_size", "temp_store", "wal_autocheckpoint"]) {
    settings[pragma] = db.readSync(`PRAGMA ${pragma}`);
  }
  return settings;
}

function assertSeed(db: Adapter) {
  const rows = db.readSync(select);
  assertEqual(rows.length, count);
  assertEqual(consume(rows), expected);
}

function consume(rows: Rows) {
  let checksum = 0;
  for (const row of rows) {
    const { id, name, value } = row;
    if (typeof id !== "number" || typeof name !== "string" || typeof value !== "number") throw new Error("Invalid row");
    checksum += id + value + name.length;
  }
  return checksum;
}

function assertEqual(actual: number, wanted: number) {
  if (actual !== wanted) throw new Error(`Expected ${wanted}, got ${actual}`);
}

function checkSpecialValues(db: Adapter) {
  const row = db.readSync(`SELECT char(65,0,66) AS text_value, 42 AS "café", NULL AS empty_value, X'0001FF' AS blob_value`)[0];
  const codes = (value: string) => Array.from({ length: value.length }, (_, i) => value.charCodeAt(i));
  const blob = row.blob_value;
  return { textCodeUnits: typeof row.text_value === "string" ? codes(row.text_value) : [],
    keyCodeUnits: Object.keys(row).map(codes), unicodeValue: row["café"] ?? "missing", nullValue: row.empty_value,
    blob: blob instanceof ArrayBuffer ? Array.from(new Uint8Array(blob)) :
      ArrayBuffer.isView(blob) ? Array.from(new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength)) : "unknown blob type" };
}
