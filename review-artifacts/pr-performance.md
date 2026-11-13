PR performance measurements, 25 September 2026

These Release measurements compare the text fix and UTF-8 runtime fix with the same code plus positional query results and grouped batch statement reuse. The two performance PRs were tested together. They are not isolated estimates for each individual source change. The iPhone 13 Pro ran iOS 26.5.2; the Samsung SM-G977B ran Android 12. React Native was 0.86, Nitro Modules 0.37.1 with the UTF-8 fix, and the bundled Nitro SQLite engine was 3.49.0.

Each case uses one warmup and five measured rounds, rotating case order. Settings are WAL, synchronous FULL, a 2 MiB page cache, and memory temporary storage. Read cases execute 250 queries over 1,000 rows and consume all three columns with a checked checksum. Batch cases send one INSERT command with 1,000 or 10,000 parameter sets; parameter arrays are built before timing. Counts are checked after execution. Devices were not thermally controlled, and Android optimized samples have a wide spread.

| Device | Case | Before median, ms | After median, ms | Before range, ms | After range, ms | Lower elapsed time |
| --- | --- | ---: | ---: | --- | --- | ---: |
| ios | read-all | 255.25 | 174.76 | 252.03 to 256.45 | 172.82 to 175.64 | 31.5% |
| ios | prepared-read-all | 255.35 | 173.73 | 251.43 to 256.22 | 171.54 to 176.28 | 32.0% |
| ios | batch-1000 | 13.37 | 7.55 | 13.08 to 14.48 | 7.38 to 7.80 | 43.6% |
| ios | batch-10000 | 54.98 | 36.80 | 54.28 to 55.63 | 33.12 to 37.07 | 33.1% |
| android | read-all | 4136.62 | 2343.99 | 4042.14 to 4213.59 | 1183.07 to 2635.10 | 43.3% |
| android | prepared-read-all | 4006.49 | 2424.88 | 3938.89 to 4083.62 | 1246.45 to 2603.50 | 39.5% |
| android | batch-1000 | 47.57 | 15.87 | 40.75 to 50.32 | 14.59 to 21.88 | 66.6% |
| android | batch-10000 | 192.51 | 116.14 | 190.07 to 199.46 | 61.69 to 146.18 | 39.7% |

Every measured sample, including the broad Android ranges, is preserved in [pr-performance-summary.json](pr-performance-summary.json). Raw iPhone records are in pr-perf-base-iphone and pr-perf-after-iphone; Android records are in runs. Both optimized device builds passed 24 focused correctness checks, including schema reprepare, empty results, repeatable getters, embedded NUL text, Unicode names, BLOB lifetime, binding reset, rollback and all-empty batch errors.

Source revisions: baseline NitroSQLite 8134c9c and Nitro property-name fix 0abe8f7; optimized positional results 2ca4b88 and batch native code 1335634. Subsequent batch commit cf41541 changes only a test assertion. The benchmark runner is src/review/prPerformance.ts. These are measurements of local source combinations in the review app, separate from the repository CI suites.
