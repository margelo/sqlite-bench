export type LibraryId = "op-sqlite" | "nitro-sqlite" | "expo-sqlite";
export type SqlValue = string | number | boolean | null | ArrayBuffer | Uint8Array;
export type Row = Record<string, unknown>;
export type QueryResult = { rows: Row[]; rowsAffected: number };
export type RawResult = { rows: unknown[][] };
export type Prepared = {
  executeSync(params: SqlValue[]): QueryResult;
  executeAsync(params: SqlValue[]): Promise<QueryResult>;
  dispose(): void;
};

export type Transaction = {
  executeAsync(sql: string, params?: SqlValue[]): Promise<QueryResult>;
};

export type Connection = {
  executeSync(sql: string, params?: SqlValue[]): QueryResult;
  executeAsync(sql: string, params?: SqlValue[]): Promise<QueryResult>;
  executeRawSync(sql: string, params?: SqlValue[]): RawResult;
  executeRawAsync(sql: string, params?: SqlValue[]): Promise<RawResult>;
  /** Wraps bytes in the type the library binds as a BLOB. */
  blob(bytes: Uint8Array): SqlValue;
  transaction(callback: (tx: Transaction) => Promise<void>): Promise<void>;
  executeHostObjects?: (sql: string) => Promise<QueryResult>;
  prepare(sql: string, kind: "read" | "write"): Prepared;
  batchAsync?: (sql: string, params: SqlValue[][]) => Promise<number | undefined>;
  batchSync?: (sql: string, params: SqlValue[][]) => number | undefined;
  close(): void;
};

export type Adapter = {
  id: LibraryId;
  label: string;
  color: string;
  version: string;
  open(name: string): Connection;
};

export type CaseRun = {
  setup(db: Connection, count: number): Promise<void>;
  run(db: Connection, count: number): Promise<number>;
  check(db: Connection, count: number, checksum: number): Promise<void>;
  teardown(db: Connection): Promise<void>;
  /** Replaces the elapsed time with a value the case measured itself, such as a frame gap. */
  reportedMs?(): number;
};

export type Case = {
  id: string;
  label: string;
  libraries: LibraryId[];
  unsupported?: Partial<Record<LibraryId, string>>;
  create(): CaseRun;
};

export type Sample = { library: LibraryId; caseId: string; round: number; ms: number; checksum: number };
export type Failure = { library: LibraryId; caseId: string; round: number; message: string };
export type Skipped = { library: LibraryId; caseId: string; reason: string };
export type Summary = { library: LibraryId; caseId: string; medianMs: number; minMs: number; maxMs: number; samples: number[] };
