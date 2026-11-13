SQLite benchmark reproduction notes, 25 September 2026

The source checkout is `/Users/chris/Projects/Margelo/sqlite-bench-review`, based on Oscar Franco's benchmark commit `d7c513c`. The original NitroSQLite workspace was not modified. The review uses a distinct application identifier, `com.chrispader.sqlitebenchreview`, and separate database names for the supplementary tests.

**Build variants.** The committed benchmark lockfile provides NitroSQLite 9.6.0, OP 18.1.3, Nitro Modules 0.36.1, Expo SQLite 57.0.0 and React Native 0.86.0. The next build changes only NitroSQLite to published 9.8.2. The current-main build uses NitroSQLite commit `45f400cb8d617fb2c807ffc7555db80449eb7afe` from the archived local package `nitro-main-clean.tgz`, OP 18.2.5 and initially the same Nitro Modules 0.36.1. A final variant changes Nitro Modules to 0.37.1. NitroSQLite main still declares package version 9.8.2, so the exported `revision` field is necessary to distinguish it from the registry release.

Every app was compiled in Release mode using Hermes. iOS builds used Xcode 27; Android builds targeted arm64-v8a. The local simulator ran iOS 27 on an Apple M4 Pro host. Physical devices were an iPhone 13 Pro running iOS 26.5.2 and a Samsung SM-G977B running Android 12/API 31. Hardware identity comes from the runtime/device records. Do not relabel the Samsung phone as the colleague's S22.

**Original workloads.** `src/app/index.tsx` retains the upstream timed loops and cooldowns. The local wrapper repeats the whole suite three times per launch and calls `recordReview` after each complete round. Its instrumentation does not add correctness assertions inside the original timing loops. The original library and workload order is retained, including the creation-only OP HostObjects case.

**Supplementary workloads.** `src/review/diagnostics.ts` adds a separate database per library, one warmup round and three measured rounds, and rotates library order. Each round inserts 1,000 rows with an integer key, short string and real value. Full reads repeat 250 times; indexed point reads repeat 1,000 times. Every returned value is consumed, typed and checked using a checksum, and every write variant is checked for row count and contents.

These connections explicitly use WAL, synchronous FULL, a 2,000 KiB page cache and memory temporary storage. Prepared statements are created outside the timed execution loop. All insertion variants commit one transaction; bulk parameter arrays are prepared before timing. The supplementary transaction loops issue BEGIN/COMMIT directly on a dedicated connection and do not exercise callback transaction scheduling. OP binding calls are included in its prepared execution time. Both batch paths are asynchronous and include their transaction. No unsupported Expo batch API is invented.

The supplementary runner also records connection defaults, final settings, SQLite source IDs, compile options and special-value results. The special-value SQL is:

```sql
SELECT char(65,0,66) AS text_value,
       42 AS "café",
       NULL AS empty_value,
       X'0001FF' AS blob_value;
```

These special-value checks are outside the timers. Numeric code units preserve malformed column-name evidence safely. The performance fixtures intentionally remain ASCII to match the original workload.

**Running the local app.** Install the selected dependency versions, regenerate native dependencies, and compile the matching Release app. Launching the review app automatically starts three original rounds followed by the supplementary rounds. Setting `EXPO_PUBLIC_REVIEW_DIAGNOSTICS_ONLY=1` while building skips the original suite; this was used for the corrected physical-iPhone supplementary run only. Clear that setting for a full run. Results are written as JSON into the app's Documents directory. An optional local HTTP collector receives the same records on port 18766. The physical iPhone results were copied from the app's own Documents directory; network upload was not required.

The local Android configuration permits cleartext traffic solely for that result collector. This setting is part of the review harness, not a library change. Native generated folders and build outputs remain local. The source changes can be reviewed against the original Git commit.

**Result aggregation.** The summarizer groups by build revision, device, workload and library; ignores warmup records and explicit exclusions; and writes individual samples, medians, minima and maxima. It does not pool simulator and phone results or different dependency variants. `results-summary.json` is the structured result and `all-results.md` is the complete table. The final report is rendered from those results and the reviewed narrative.

**Excluded data and failures.** A simulator launch with native profiling enabled (`1790353107301`) is excluded in full. The profiler failed to produce a usable trace, so the review makes no percentage attribution to native allocation, JavaScript conversion or garbage collection. A second simulator launch (`1790353822289`) overlapped native compilation and is also excluded in full; its original workload was rerun with the host idle.

The first physical-iPhone supplementary export (`1790353548800`, diagnostic records only) reused filenames between libraries and attempted to serialize the corrupted Unicode key. Those incomplete supplementary records are excluded, while its valid original results are retained. The supplementary suite was rerun with unique filenames and numeric code-unit evidence. Simulator current-main supplementary records from `1790353997981` are likewise excluded because they used the older serializer; that launch's original results are retained. No partial-library supplementary table is presented from these failed exports. Raw files and logs remain available for inspection.

These are medians of three measured rounds within a launch, with a discarded warmup only in the supplementary suite. They are not independent cold-launch medians, confidence intervals or a device-fleet study. Device thermal state, charging and background activity were not experimentally controlled. The result is suitable for identifying credible bottlenecks and designing stronger benchmarks, rather than claiming universal library rankings.
