SQLite benchmark follow-up PR plans

These plans are based on the completed device measurements and a fresh source check on 25 September 2026. NitroSQLite main is now `8dc98a1`, and NitroSQLite 10.0.0 is published. The benchmark update will use that release, OP 18.2.5 and Nitro Modules 0.37.1. Implementation is delegated to separate GPT-6 Sol agents; planning and integration review stay in this task.

Each PR uses an isolated worktree, a focused branch, a signed conventional commit where signing is available, and a description that starts with the concrete problem. Device builds and measurements are coordinated centrally. No PR should claim device or performance results that have not been observed on its code.

| Plan | Pull request | Dependency |
| --- | --- | --- |
| 1. Embedded-NUL text | [NitroSQLite #386](https://github.com/margelo/react-native-nitro-sqlite/pull/386) | Main |
| 2. UTF-8 record keys | [Nitro #1658](https://github.com/margelo/nitro/pull/1658) | Main |
| 3. Positional query results | [NitroSQLite #389](https://github.com/margelo/react-native-nitro-sqlite/pull/389) | #386 |
| 4. Batch statement reuse | [NitroSQLite #387](https://github.com/margelo/react-native-nitro-sqlite/pull/387) | Main |
| 5. Private SQLite symbols | [NitroSQLite #390](https://github.com/margelo/react-native-nitro-sqlite/pull/390) | Main |
| 6. Current benchmark dependencies | [sqlite-bench #1](https://github.com/ospfranco/sqlite-bench/pull/1) | Main |
| 7. Comparable benchmark runs | [sqlite-bench #2](https://github.com/ospfranco/sqlite-bench/pull/2) | Main |
| 8. Prepared, batch and dispatch coverage | [sqlite-bench #3](https://github.com/ospfranco/sqlite-bench/pull/3) | sqlite-bench #1 and #2 |

**PR 1. Preserve embedded-NUL SQLite text.** Repository: `margelo/react-native-nitro-sqlite`. Base: current main. Proposed branch: `fix/sqlite-text-byte-length`.

The result reader constructs strings from a NUL-terminated pointer, which truncates valid returned text. Construct text with SQLite's reported byte length in the common ordinary/prepared result path. Preserve NULL, empty-string and BLOB behavior, and handle allocation/error cases without undefined pointer operations. Keep the change independent of result-layout work.

Add regression cases for SQL-generated and bound strings containing leading, middle and trailing NULs, Unicode around NULs, empty strings, and repeated prepared execution. Prove the old code fails the regression and the new code preserves exact code units. Run the applicable native and JavaScript tests, followed by iOS and Android result checks. This PR does not alter property names or scheduling.

**PR 2. Preserve UTF-8 dynamic property names.** Repository: `margelo/nitro`. Base: current main. Proposed branch: `fix/utf8-property-name-cache`.

The property-name cache constructs arbitrary dynamic keys with an ASCII API, corrupting non-ASCII record keys. Use length-aware UTF-8 construction at that boundary, retaining the existing runtime-specific cache and its lifetime rules. Inspect other dynamic-key conversion paths reached by the same record APIs so the regression test exercises the real affected converter.

Cover accented, CJK, supplementary-plane and mixed ASCII keys, repeated cache hits, and both conversion directions where supported. Check that distinct UTF-8 keys remain distinct and values survive round trips. Use the existing native example/test infrastructure; do not add unrelated cache, locking or lifetime refactors. Re-run the SQLite alias reproduction with the patched runtime.

**PR 3. Store query values positionally and convert without a full native copy.** Repository: `margelo/react-native-nitro-sqlite`. Base: main, with PR 1's text fix included through a focused stack only if necessary. Proposed branch: `perf/positional-query-results`.

Use one result-level collection of column names and positional native rows. Convert object rows with one property-name collection per result, while preserving the existing public result API. Replace the getter's full native copy with an explicit ownership model compatible with generated Nitro interfaces. Avoid retaining redundant native and JavaScript representations where the existing observable lifetime permits it. Do not empty a repeatable getter or silently change its semantics to achieve a benchmark improvement.

Treat layout and conversion ownership as one PR because they operate on the same result representation. Before implementation, document the generated-interface contract and choose the narrowest compatible converter. Preserve duplicate aliases, metadata, empty results, row access, repeated getter access, object mutation expectations, embedded NULs, Unicode names, NULLs, numeric values and BLOB lifetime. Regenerate affected bindings through the project generator.

Run existing result and prepared-query tests plus focused native/runtime coverage. Measure the same fully consumed Release workloads against the unchanged base on both platforms, with identical dependencies and PRAGMAs. Report individual samples, allocation/retention evidence where available, and any regressions. If the complete retention reduction requires a public behavior change, keep that part out and report the remaining limitation explicitly.

**PR 4. Reuse prepared statements for grouped batch parameters.** Repository: `margelo/react-native-nitro-sqlite`. Base: current main. Proposed branch: `perf/reuse-batch-statements`.

The batch path flattens repeated parameter groups, duplicates query strings and prepares each execution separately. Preserve grouped commands through the native boundary, prepare once per group, then bind, step, reset and clear bindings for each parameter set. Finalize through RAII on success and failure. Reuse existing prepared-statement primitives where their ownership and locking fit; do not introduce a global or unbounded SQL cache.

Preserve sync and async behavior, callback-transaction use, connection serialization, rollback, command counts, affected-row counts, empty groups, parameter omission and error propagation. Audit the open undefined-parameter PR separately and avoid absorbing that unrelated fix. Cover repeated values, shorter parameter lists, NULLs, text and BLOBs, failing middle commands, schema effects and reuse after errors. Prove preparation count is reduced with a meaningful native test and compare bulk-write Release measurements with the base.

**PR 5. Isolate NitroSQLite's bundled SQLite symbols.** Repository: `margelo/react-native-nitro-sqlite`. Base: current main. Proposed branch: `fix/private-sqlite-symbols`.

Co-installing the libraries can cause Nitro and OP to execute the same unprefixed SQLite implementation. Give Nitro's bundled SQLite API and exported data symbols a private prefix. Apply the mapping to the amalgamation, Nitro call sites and the optional vector extension through the narrowest supported build/header boundary. Keep vendor updates reproducible and avoid changing compiler definitions globally for consumers or unrelated pods.

Include exported globals such as the version string, not only functions. Check static iOS linkage, Android shared libraries, macOS support and vector-extension registration. Add a native coexistence/link test using another SQLite implementation, inspect exported and unresolved symbols, and verify source IDs, compile options and version values in the combined benchmark app. Do not claim this fixes collisions between OP and Expo themselves. Do not change SQLite versions or durability defaults in this PR.

**PR 6. Refresh the benchmark library dependencies.** Repository: `ospfranco/sqlite-bench`, through a fork. Base: upstream main. Proposed branch: `chore/current-sqlite-libraries`.

Update the three SQLite libraries and Nitro Modules to the currently verified compatible releases. Keep React Native and Expo framework upgrades out unless compatibility requires them. Regenerate the existing lockfile, preserve the app's platform configuration, and keep the benchmark loops unchanged so dependency effects remain reviewable.

Build the existing Release app on iOS and Android and record resolved versions. Do not commit local package tarballs, device identifiers, personal bundle identifiers, exported benchmark data or generated native build output. NitroSQLite 10.0.0 now provides the prepared API needed by PR 8.

**PR 7. Make benchmark comparisons repeatable and equivalent.** Repository: `ospfranco/sqlite-bench`, through a fork. Base: PR 6 if dependency metadata requires it; otherwise upstream main. Proposed branch: `fix/comparable-benchmark-runs`.

Separate creation-only HostObjects from fully consumed rows, validate returned values and inserted counts, and give libraries equivalent setup and cooldown behavior. Add an explicit warmup/repetition policy, rotate library order, report individual samples with medians and spread, and store a reproducibility manifest. Do not label allocation-and-sleep as forced garbage collection.

Record library/runtime versions, build mode, device/OS, actual SQLite source IDs, compile options and PRAGMAs. Distinguish default-setting comparisons from normalized-setting comparisons. Detect shared-engine or inconsistent-version evidence and display a clear limitation rather than silently declaring an independently bundled-engine comparison. Keep UI work and export work outside timed sections. Use focused modules without gratuitous UI redesign.

Validate the runner's result aggregation and failure reporting, then execute it on iOS and Android. Preserve original-style convenience workloads as separately labelled cases. Do not import the local review's personal transport or device setup into the upstream PR.

**PR 8. Benchmark prepared statements, batching and dispatch overhead.** Repository: `ospfranco/sqlite-bench`, through a fork. Base: PR 7 and PR 6. Proposed branch: `feat/prepared-and-batch-benchmarks`.

Add reusable prepared-statement reads and inserts for every supporting library, synchronous inserts inside one transaction, existing asynchronous batch APIs, and matched small synchronous/asynchronous operations. Use the same logical data, durability settings and checked consumption for equivalent comparisons. Prepare statements and parameter fixtures outside repeated-execution timers, include binding in execution timings, and finalize through the library's supported lifecycle.

Keep full-result consumption, point reads and write cases separate. Do not invent unsupported API equivalents or treat an ordinary convenience call as statement reuse. Preserve atomicity and queue ownership; dedicated explicit transactions must be labelled separately from callback transactions. The small-operation cases measure dispatch-sensitive end-to-end costs without changing library scheduling.

Run warmup plus repeated measured rounds on both platforms and check the output labels, fixture counts and checksums. Document how to reproduce the comparison and distinguish evidence from proposed worker/queue optimizations.

**Dependency and review order.** PRs 1, 2 and 4 can proceed independently. PR 3 targets PR 1's branch to keep its diff focused. PR 5 has an independent build/link boundary. PR 6 precedes the final benchmark API coverage. PR 7 targets upstream main independently and provides the measurement framework for PR 8. The benchmark changes originate in a fork, so upstream cannot use the fork's prerequisite branches as PR bases. PR 8 therefore targets upstream main and identifies the included prerequisite commits until PRs 6 and 7 merge.

Changing async queue architecture, mutex modes or durability requires evidence beyond the completed review and is excluded from these implementation PRs. This series preserves the existing public API. A new public raw-result API needs a separate API-design decision.
