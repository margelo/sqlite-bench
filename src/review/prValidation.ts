import { open } from "react-native-nitro-sqlite";
import { recordReview } from "./record";

export async function runPrValidation() {
  const db = open({ name: "review_pr_validation.db" });
  const checks: { name: string; passed: boolean; error?: string }[] = [];
  const check = (name: string, action: () => void) => {
    try { action(); checks.push({ name, passed: true }); }
    catch (error) { checks.push({ name, passed: false, error: String(error) }); }
  };
  const equal = (actual: unknown, expected: unknown) => {
    const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stable(item)])) : value;
    if (JSON.stringify(stable(actual)) !== JSON.stringify(stable(expected))) throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  };
  try {
    const values = ["\0leading", "mid\0dle", "trailing\0", "é\0中😀", "", "\0"];
    for (const value of values) {
      check(`ordinary bound text ${JSON.stringify(value)}`, () => equal(db.execute("SELECT ? AS value", [value]).rows.item(0)?.value, value));
    }
    check("SQL-generated NUL, empty text, NULL", () => equal(db.execute("SELECT char(0) || 'é' || char(0) || '中😀' || char(0) AS value, '' AS empty, NULL AS nullable").rows.item(0), { value: "\0é\0中😀\0", empty: "", nullable: null }));
    const text = db.prepare("SELECT ? AS value");
    try {
      for (const value of [...values, values[0]]) {
        check(`prepared text ${JSON.stringify(value)}`, () => equal(text.execute([value]).rows.item(0)?.value, value));
      }
    } finally { text.finalize(); }
    const names = ["cafe", "café", "咖啡", "🚀", "prefix-咖啡-🚀"];
    const sql = `SELECT ${names.map((name, i) => `${i + 1} AS "${name}"`).join(", ")}`;
    const expected = Object.fromEntries(names.map((name, i) => [name, i + 1]));
    for (let round = 0; round < 3; round++) {
      check(`UTF8 names and cache reuse ${round}`, () => {
        const row = db.execute(sql).rows.item(0)!;
        equal(Object.keys(row).sort(), [...names].sort());
        for (const name of names) equal(row[name], expected[name]);
      });
    }
    check("repeated result getters are independent", () => {
      const result = db.execute("SELECT 1 AS id, 'abc' AS name");
      const first = result.results;
      first[0].name = "mutated";
      first.push({ id: 2, name: "other" });
      equal(result.results, [{ id: 1, name: "abc" }]);
      equal(result.rows._array, [{ id: 1, name: "abc" }]);
    });
    check("duplicate names retain last value", () => equal(db.execute("SELECT 1 AS value, 2 AS value").rows.item(0)?.value, 2));
    check("BLOB remains valid after statement finalization", () => {
      const statement = db.prepare("SELECT X'0001FF' AS value");
      const result = statement.execute();
      statement.finalize();
      equal(Array.from(new Uint8Array(result.rows.item(0)?.value as ArrayBuffer)), [0, 1, 255]);
    });
    check("prepared SELECT star follows schema changes for populated and empty results", () => {
      db.execute("DROP TABLE IF EXISTS schema_check");
      db.execute("CREATE TABLE schema_check (id INTEGER)");
      db.execute("INSERT INTO schema_check VALUES (1)");
      const all = db.prepare("SELECT * FROM schema_check");
      const empty = db.prepare("SELECT * FROM schema_check WHERE id < 0");
      try {
        db.execute("ALTER TABLE schema_check ADD COLUMN name TEXT DEFAULT 'added'");
        equal(all.execute().rows._array, [{ id: 1, name: "added" }]);
        equal(empty.execute().rows.length, 0);
        equal(Object.keys(empty.execute().metadata ?? {}).sort(), ["id", "name"]);
      } finally { all.finalize(); empty.finalize(); }
    });
    check("all-empty grouped batch retains error", () => {
      let threw = false;
      try { db.executeBatch([{ query: "INSERT INTO missing_table VALUES (?)", params: [] }]); }
      catch { threw = true; }
      equal(threw, true);
    });
    check("grouped batch clears omitted bindings", () => {
      db.execute("DROP TABLE IF EXISTS batch_check");
      db.execute("CREATE TABLE batch_check (id INTEGER PRIMARY KEY, value TEXT)");
      db.executeBatch([{ query: "INSERT INTO batch_check VALUES (?, ?)", params: [[1, "first"], [2], [3, null]] }]);
      equal(db.execute("SELECT * FROM batch_check ORDER BY id").rows._array, [{ id: 1, value: "first" }, { id: 2, value: null }, { id: 3, value: null }]);
    });
    check("grouped batch rolls back after constraint error", () => {
      let threw = false;
      try { db.executeBatch([{ query: "INSERT INTO batch_check VALUES (?, ?)", params: [[4, "new"], [1, "duplicate"], [5, "later"]] }]); }
      catch { threw = true; }
      equal(threw, true);
      equal(db.execute("SELECT count(*) AS value FROM batch_check").rows.item(0)?.value, 3);
    });
    await recordReview({ kind: "pr-validation", checks, passed: checks.filter((value) => value.passed).length, failed: checks.filter((value) => !value.passed).length });
  } finally { db.close(); }
}
