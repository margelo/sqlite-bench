import { File, Paths } from "expo-file-system";

const LOG_CHUNK = 3000;

/**
 * Saves a finished run as JSON in the app's documents folder and prints it in
 * chunks prefixed with `SQLITE_BENCH <kind>`. iOS Release builds drop
 * console.log, so the file is the source there. Android Release builds keep
 * console output in logcat, which cuts lines at about 4 KB.
 */
export function exportRun(kind: string, payload: unknown): void {
  const body = JSON.stringify(payload);
  try {
    new File(Paths.document, `${kind}-${Date.now()}.json`).writeSync(body);
  } catch (error) {
    console.warn(`Could not save the ${kind} run`, error);
  }
  const total = Math.ceil(body.length / LOG_CHUNK);
  for (let index = 0; index < total; index++) {
    console.log(`SQLITE_BENCH ${kind} ${index + 1}/${total} ${body.slice(index * LOG_CHUNK, (index + 1) * LOG_CHUNK)}`);
  }
}
