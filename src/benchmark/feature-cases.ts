import { assertEqual, checkInserted, consume, dropTable, emptyTable, expectedChecksum, INSERT, populatedTable, SELECT, values } from "./fixtures";
import type { Case, CaseRun, Connection, LibraryId, Row } from "./types";

// Cases for library features the original four tests do not use: rows as
// arrays, wide rows, BLOBs, one large result, concurrent async queries and a
// synchronous native batch.

const all: LibraryId[] = ["op-sqlite", "nitro-sqlite", "expo-sqlite"];
const LARGE_READ_FACTOR = 400;
const BLOB_BYTES = 16 * 1024;
const BLOB_READS = 10;
const WIDE_TEXT_COLUMNS = 9;
const WIDE_REAL_COLUMNS = 10;
const POINT = "SELECT id, name, value FROM bench WHERE id = ?";

export const featureCases: Case[] = [
  rawReadCase("sync"),
  rawReadCase("async"),
  {
    id: "wide-async-full-read",
    label: "async full read of 20-column rows",
    libraries: all,
    create: () => ({
      setup: populateWide,
      run: async (db, count) => {
        let checksum = 0;
        for (let i = 0; i < count; i++) checksum += consumeWide((await db.executeAsync("SELECT * FROM wide ORDER BY id")).rows, count);
        return checksum;
      },
      check: async (_db, count, checksum) => assertEqual(checksum, wideChecksum(count) * count, "wide checksum"),
      teardown: async (db) => { db.executeSync("DROP TABLE IF EXISTS wide"); },
    }),
  },
  {
    id: "blob-async-read",
    label: `async read of 16 KB BLOBs (${BLOB_READS} queries)`,
    libraries: all,
    create: () => ({
      setup: populateBlobs,
      run: async (db, count) => {
        let checksum = 0;
        for (let i = 0; i < BLOB_READS; i++) checksum += consumeBlobs((await db.executeAsync("SELECT id, data FROM blobs ORDER BY id")).rows, count);
        return checksum;
      },
      check: async (_db, count, checksum) => assertEqual(checksum, blobChecksum(count) * BLOB_READS, "BLOB checksum"),
      teardown: async (db) => { db.executeSync("DROP TABLE IF EXISTS blobs"); },
    }),
  },
  largeReadCase("elapsed"),
  largeReadCase("frame gap"),
  {
    id: "concurrent-async-point-read",
    label: "concurrent async indexed point reads (all queries in flight)",
    libraries: all,
    create: () => ({
      setup: populatedTable,
      run: async (db, count) => {
        const results = await Promise.all(Array.from({ length: count }, (_, i) => db.executeAsync(POINT, [i])));
        let checksum = 0;
        for (let i = 0; i < results.length; i++) {
          assertEqual(results[i].rows.length, 1, "point row count");
          checksum += pointChecksum(results[i].rows[0], i);
        }
        return checksum;
      },
      check: async (_db, count, checksum) => assertEqual(checksum, expectedChecksum(count), "point checksum"),
      teardown: dropTable,
    }),
  },
  {
    id: "native-sync-batch-insert",
    label: "native sync batch insert (one transaction)",
    libraries: ["nitro-sqlite"],
    unsupported: {
      "op-sqlite": "No public synchronous batch API in 19.0.5",
      "expo-sqlite": "No native parameter batch API",
    },
    create: () => {
      let parameters: ReturnType<typeof values>[] = [];
      return {
        setup: async (db, count) => {
          await emptyTable(db);
          parameters = Array.from({ length: count }, (_, index) => values(index));
        },
        run: async (db, count) => {
          if (!db.batchSync) throw new Error("Native sync batch API unsupported");
          const affected = db.batchSync(INSERT, parameters);
          if (affected !== undefined) assertEqual(affected, count, "batch affected rows");
          return count;
        },
        check: checkInserted,
        teardown: dropTable,
      };
    },
  },
];

function rawReadCase(dispatch: "sync" | "async"): Case {
  return {
    id: `raw-${dispatch}-full-read`,
    label: `${dispatch} full row read as arrays (executeRaw)`,
    libraries: all,
    create: () => ({
      setup: populatedTable,
      run: async (db, count) => {
        let checksum = 0;
        for (let i = 0; i < count; i++) {
          const result = dispatch === "sync" ? db.executeRawSync(SELECT) : await db.executeRawAsync(SELECT);
          checksum += consumeRaw(result.rows, count);
        }
        return checksum;
      },
      check: async (_db, count, checksum) => assertEqual(checksum, expectedChecksum(count) * count, "raw read checksum"),
      teardown: dropTable,
    }),
  };
}

// One query that returns LARGE_READ_FACTOR times the configured row count. The
// frame gap variant reports the longest time between animation frames while the
// query and its conversion run, which is how long the JS thread could not render.
function largeReadCase(metric: "elapsed" | "frame gap"): Case {
  return {
    id: metric === "elapsed" ? "large-async-read" : "large-async-read-frame-gap",
    label: metric === "elapsed"
      ? "async read of one large result (400 × rows)"
      : "longest frame gap during the large async read",
    libraries: all,
    create: (): CaseRun => {
      let longestGap = 0;
      return {
        setup: async (db, count) => {
          await emptyTable(db);
          insertInTransaction(db, count * LARGE_READ_FACTOR, (i) => db.executeSync(INSERT, values(i)));
        },
        run: async (db, count) => {
          const stop = metric === "frame gap" ? trackFrames() : undefined;
          const result = await db.executeAsync(SELECT);
          const checksum = consume(result, count * LARGE_READ_FACTOR);
          if (stop) longestGap = stop();
          return checksum;
        },
        check: async (_db, count, checksum) => assertEqual(checksum, expectedChecksum(count * LARGE_READ_FACTOR), "large read checksum"),
        teardown: dropTable,
        reportedMs: metric === "frame gap" ? () => longestGap : undefined,
      };
    },
  };
}

function trackFrames(): () => number {
  let last = performance.now();
  let longest = 0;
  let active = true;
  const tick = () => {
    const now = performance.now();
    longest = Math.max(longest, now - last);
    last = now;
    if (active) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => {
    active = false;
    return Math.max(longest, performance.now() - last);
  };
}

function insertInTransaction(db: Connection, count: number, insert: (index: number) => void) {
  db.executeSync("BEGIN");
  try {
    for (let i = 0; i < count; i++) insert(i);
    db.executeSync("COMMIT");
  } catch (error) {
    try { db.executeSync("ROLLBACK"); }
    catch { /* Preserve the insert failure if SQLite already rolled back. */ }
    throw error;
  }
}

function consumeRaw(rows: unknown[][], count: number): number {
  assertEqual(rows.length, count, "returned rows");
  let checksum = 0;
  for (let i = 0; i < rows.length; i++) {
    const [id, name, value] = rows[i];
    if (id !== i || name !== `n${i}` || value !== i * 1.5) throw new Error(`Wrong raw row at index ${i}`);
    checksum += i + i * 1.5 + name.length;
  }
  return checksum;
}

function pointChecksum(row: Row, index: number): number {
  const [id, name, value] = values(index);
  if (row.id !== id || row.name !== name || row.value !== value) throw new Error(`Wrong point row for id ${index}`);
  return id + value + name.length;
}

function wideValues(index: number) {
  return [
    index,
    ...Array.from({ length: WIDE_TEXT_COLUMNS }, (_, column) => `t${column}-${index}`),
    ...Array.from({ length: WIDE_REAL_COLUMNS }, (_, column) => index * 0.5 + column),
  ];
}

async function populateWide(db: Connection, count: number) {
  const text = Array.from({ length: WIDE_TEXT_COLUMNS }, (_, column) => `t${column} TEXT`);
  const real = Array.from({ length: WIDE_REAL_COLUMNS }, (_, column) => `r${column} REAL`);
  db.executeSync("DROP TABLE IF EXISTS wide");
  db.executeSync(`CREATE TABLE wide (id INTEGER PRIMARY KEY, ${[...text, ...real].join(", ")})`);
  const insert = `INSERT INTO wide VALUES (${Array(1 + WIDE_TEXT_COLUMNS + WIDE_REAL_COLUMNS).fill("?").join(",")})`;
  insertInTransaction(db, count, (i) => db.executeSync(insert, wideValues(i)));
}

function consumeWide(rows: Row[], count: number): number {
  assertEqual(rows.length, count, "returned wide rows");
  let checksum = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    checksum += row.id as number;
    for (let column = 0; column < WIDE_TEXT_COLUMNS; column++) checksum += (row[`t${column}`] as string).length;
    for (let column = 0; column < WIDE_REAL_COLUMNS; column++) checksum += row[`r${column}`] as number;
  }
  return checksum;
}

function wideChecksum(count: number): number {
  let checksum = 0;
  for (let i = 0; i < count; i++) {
    const [id, ...rest] = wideValues(i);
    checksum += id as number;
    for (const value of rest) checksum += typeof value === "string" ? value.length : value;
  }
  return checksum;
}

async function populateBlobs(db: Connection, count: number) {
  db.executeSync("DROP TABLE IF EXISTS blobs");
  db.executeSync("CREATE TABLE blobs (id INTEGER PRIMARY KEY, data BLOB)");
  insertInTransaction(db, count, (i) => db.executeSync("INSERT INTO blobs VALUES (?, ?)", [i, db.blob(new Uint8Array(BLOB_BYTES).fill(i % 256))]));
}

function consumeBlobs(rows: Row[], count: number): number {
  assertEqual(rows.length, count, "returned BLOB rows");
  let checksum = 0;
  for (let i = 0; i < rows.length; i++) {
    const bytes = asBytes(rows[i].data);
    if (bytes.byteLength !== BLOB_BYTES || bytes[0] !== i % 256 || bytes[BLOB_BYTES - 1] !== i % 256) throw new Error(`Wrong BLOB at index ${i}`);
    checksum += bytes.byteLength + bytes[0];
  }
  return checksum;
}

function blobChecksum(count: number): number {
  let checksum = 0;
  for (let i = 0; i < count; i++) checksum += BLOB_BYTES + (i % 256);
  return checksum;
}

function asBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw new Error("BLOB column did not return bytes");
}
