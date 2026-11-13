# Results, 13 November 2026

These runs compare op-sqlite 19.0.5, Nitro SQLite 10.3.0 and expo-sqlite 58.0.17 on Expo SDK 58 (React Native 0.88.1, Hermes) in Release builds. They cover the four tests from the original benchmark screen on a Galaxy S10 5G, the iOS simulator and the Android emulator, the same tests on F2FS with batch atomic writes off and on, and the full suite with prepared statements, batches, raw arrays and the newer cases on the iOS simulator and the Android emulator.

## Summary

Nitro SQLite reads faster than op-sqlite on every device. On "select + read props", which runs 1,000 queries of 1,000 rows and reads every property, Nitro took 3,212 ms on the Galaxy S10 against op-sqlite's 4,864 ms (1.51×), and was 1.22× to 1.36× faster in the simulator and emulator runs.

Single-row commits, the sync and async insert tests, are level. With batch atomic writes off for both, the two libraries stay within 6% of each other on every device, because each of those tests is mostly 1,000 disk syncs.

The transaction insert runs 1,000 awaited inserts inside one transaction. Nitro was 1.90× faster on the Galaxy S10 (484 ms against 918 ms). On the iOS simulator op-sqlite was faster (24 ms against 27 ms), and on the Android emulator the two were within 13%.

Turning on F2FS batch atomic writes for both libraries shortened commits on the emulated F2FS volume by about 10–20% for both, and the ratios between them stayed within the run-to-run spread. Nitro's lead on reads comes from its result conversion, not from a compile flag.

On the same Galaxy S10 in September, with Nitro SQLite main before 10.2.0, the read test took 18,517 ms with Nitro and 4,843 ms with op-sqlite.

## Setup

Both op-sqlite and Nitro SQLite compile SQLite 3.53.4 with their performance flags on and use `fdatasync()` for commits on Android. Batch atomic writes are off for both except in the F2FS-on runs. expo-sqlite uses its own SQLite 3.53.3 with its defaults. Nitro SQLite prefixes its SQLite symbols, so on iOS each library runs its own SQLite copy.

The four tests use the same workloads as the original screen: 1,000 rows, 1,000 `SELECT *` queries and a 2.5 second cooldown before each test. Compared with the original screen, every library now gets the same cooldowns, op-sqlite's HostObjects case reads every property like the other libraries, and each launch runs three rounds with the library order rotating. The tables pool every round of every launch.

The iPhone simulator and Android emulator ran on an Apple Silicon Mac with other simulators active, so their absolute times only describe that Mac, and their small differences are within noise. The emulator's `/data` uses ext4. For the F2FS runs, the app's `databases` and `files` folders were mounted on F2FS loop volumes inside the emulator, with SELinux set to permissive. An emulated F2FS volume is not a phone's flash storage, so the size of the batch atomic write effect there does not carry over to phones.

## Original four tests

### Galaxy S10 5G (SM-G977B), Android 12, physical phone

3 launches × 3 rounds. Median ms, minimum to maximum in brackets.

| Test | op-sqlite | op-sqlite HostObjects | Nitro SQLite | expo-sqlite | op-sqlite ÷ Nitro |
|---|---:|---:|---:|---:|---:|
| sync insert | 4,373 (4,077–4,480) | – | 4,360 (4,202–4,536) | 6,334 (5,983–6,719) | 1.00 |
| async insert | 4,798 (4,696–5,188) | – | 4,695 (4,587–4,833) | 10,265 (9,575–10,556) | 1.02 |
| tx insert | 918 (333–1,088) | – | 484 (244–730) | 2,445 (2,165–2,646) | 1.90 |
| select + read props | 4,864 (3,435–5,691) | 10,046 (8,767–11,131) | 3,212 (2,569–3,825) | 28,931 (24,821–30,993) | 1.51 |

### iPhone 18 Pro simulator, iOS 27

3 launches × 3 rounds. Median ms, minimum to maximum in brackets.

| Test | op-sqlite | op-sqlite HostObjects | Nitro SQLite | expo-sqlite | op-sqlite ÷ Nitro |
|---|---:|---:|---:|---:|---:|
| sync insert | 344 (306–588) | – | 331 (309–570) | 448 (327–635) | 1.04 |
| async insert | 364 (332–736) | – | 386 (347–770) | 442 (400–735) | 0.94 |
| tx insert | 24 (20–27) | – | 27 (21–33) | 85 (71–89) | 0.86 |
| select + read props | 360 (350–486) | 607 (592–701) | 265 (254–380) | 920 (899–1,071) | 1.36 |

### Android emulator (Pixel 9 Pro image), Android 15, ext4

3 launches × 3 rounds. Median ms, minimum to maximum in brackets.

| Test | op-sqlite | op-sqlite HostObjects | Nitro SQLite | expo-sqlite | op-sqlite ÷ Nitro |
|---|---:|---:|---:|---:|---:|
| sync insert | 1,119 (1,057–1,261) | – | 1,120 (1,087–1,312) | 1,429 (1,308–1,988) | 1.00 |
| async insert | 1,316 (1,199–1,454) | – | 1,279 (1,155–1,546) | 1,902 (1,604–2,246) | 1.03 |
| tx insert | 127 (110–149) | – | 128 (96–156) | 471 (443–935) | 0.99 |
| select + read props | 419 (381–469) | 763 (719–842) | 312 (295–338) | 2,090 (1,996–2,291) | 1.34 |

### Android emulator on an F2FS volume, batch atomic writes off

4 launches × 3 rounds. Median ms, minimum to maximum in brackets.

| Test | op-sqlite | op-sqlite HostObjects | Nitro SQLite | expo-sqlite | op-sqlite ÷ Nitro |
|---|---:|---:|---:|---:|---:|
| sync insert | 2,819 (2,317–3,124) | – | 2,681 (2,464–3,220) | 3,094 (2,529–3,654) | 1.05 |
| async insert | 2,484 (2,399–3,234) | – | 2,633 (2,397–3,224) | 3,155 (2,880–3,684) | 0.94 |
| tx insert | 129 (113–165) | – | 116 (103–149) | 474 (444–797) | 1.11 |
| select + read props | 422 (404–484) | 782 (730–1,161) | 346 (292–371) | 2,174 (2,012–2,455) | 1.22 |

### Android emulator on an F2FS volume, batch atomic writes on

3 launches × 3 rounds. Median ms, minimum to maximum in brackets.

| Test | op-sqlite | op-sqlite HostObjects | Nitro SQLite | expo-sqlite | op-sqlite ÷ Nitro |
|---|---:|---:|---:|---:|---:|
| sync insert | 2,420 (1,337–2,672) | – | 2,112 (1,089–2,853) | 2,879 (2,555–3,743) | 1.15 |
| async insert | 2,518 (1,361–2,776) | – | 2,495 (1,449–2,627) | 3,000 (2,603–3,594) | 1.01 |
| tx insert | 135 (115–313) | – | 119 (106–213) | 460 (391–501) | 1.13 |
| select + read props | 424 (396–465) | 813 (763–874) | 328 (306–390) | 2,140 (2,011–2,372) | 1.29 |

### Screenshots

Each screenshot pair shows one launch, with the top of the screen first and the remaining tests below it.

| Device | Screenshots |
|---|---|
| Galaxy S10 | run 1 [top](screenshots/galaxy-s10-original/run1-1-top.jpg) and [bottom](screenshots/galaxy-s10-original/run1-2-bottom.jpg), run 2 [top](screenshots/galaxy-s10-original/run2-1-top.jpg) and [bottom](screenshots/galaxy-s10-original/run2-2-bottom.jpg), run 3 [top](screenshots/galaxy-s10-original/run3-1-top.jpg) and [bottom](screenshots/galaxy-s10-original/run3-2-bottom.jpg) |
| iPhone simulator | [top](screenshots/iphone-simulator-original/1-top.jpg) and [bottom](screenshots/iphone-simulator-original/2-bottom.jpg) |
| Android emulator, ext4 | [top](screenshots/android-emulator-ext4-original/1-top.jpg) and [bottom](screenshots/android-emulator-ext4-original/2-bottom.jpg) |
| Android emulator, F2FS, batch atomic writes off | [top](screenshots/android-emulator-f2fs-off-original/1-top.jpg) and [bottom](screenshots/android-emulator-f2fs-off-original/2-bottom.jpg) |
| Android emulator, F2FS, batch atomic writes on | run 1 [top](screenshots/android-emulator-f2fs-on-original/run1-1-top.jpg) and [bottom](screenshots/android-emulator-f2fs-on-original/run1-2-bottom.jpg), run 2 [top](screenshots/android-emulator-f2fs-on-original/run2-1-top.jpg) and [bottom](screenshots/android-emulator-f2fs-on-original/run2-2-bottom.jpg), run 3 [top](screenshots/android-emulator-f2fs-on-original/run3-1-top.jpg) and [bottom](screenshots/android-emulator-f2fs-on-original/run3-2-bottom.jpg) |

<p>
<img src="screenshots/galaxy-s10-original/run3-1-top.jpg" width="270" alt="Galaxy S10, run 3, top">
<img src="screenshots/galaxy-s10-original/run3-2-bottom.jpg" width="270" alt="Galaxy S10, run 3, bottom">
</p>

## Suite

The suite uses 250 rows, one warmup round and three measured rounds, and rotates the library order for every case. Each cell shows op-sqlite's and Nitro SQLite's median and the ratio, where a value above 1 means Nitro was faster. The Expo numbers are in the data files.

| Case | iPhone simulator: op / Nitro ms | Android emulator: op / Nitro ms |
|---|---:|---:|
| sync-insert | 86.7 / 85.3 (1.02×) | 298.7 / 285.8 (1.05×) |
| async-insert | 93.8 / 102.0 (0.92×) | 337.3 / 296.8 (1.14×) |
| transaction-insert | 10.6 / 10.3 (1.03×) | 33.8 / 38.4 (0.88×) |
| full-read | 38.2 / 38.5 (0.99×) | 90.0 / 50.9 (1.77×) |
| host-creation | 43.2 / – | 97.8 / – |
| host-full-read | 61.6 / – | 96.9 / – |
| ordinary-sync-full-read | 31.8 / 31.3 (1.02×) | 55.9 / 25.9 (2.16×) |
| prepared-sync-full-read | 46.0 / 30.1 (1.53×) | 55.8 / 51.2 (1.09×) |
| ordinary-async-full-read | 42.0 / 37.6 (1.12×) | 88.5 / 77.2 (1.15×) |
| prepared-async-full-read | 60.9 / 40.5 (1.50×) | 115.3 / 68.6 (1.68×) |
| ordinary-sync-point-read | 9.7 / 9.4 (1.03×) | 8.0 / 9.4 (0.84×) |
| prepared-sync-point-read | 9.0 / 9.2 (0.98×) | 7.2 / 3.8 (1.88×) |
| ordinary-async-point-read | 12.4 / 14.9 (0.83×) | 65.3 / 66.4 (0.98×) |
| prepared-async-point-read | 12.7 / 16.6 (0.76×) | 65.5 / 60.2 (1.09×) |
| ordinary-sync-manual-transaction-insert | 2.1 / 3.5 (0.61×) | 9.0 / 9.1 (0.98×) |
| prepared-sync-manual-transaction-insert | 2.7 / 2.3 (1.17×) | 3.1 / 9.1 (0.34×) |
| ordinary-async-manual-transaction-insert | 9.7 / 10.4 (0.93×) | 52.7 / 63.1 (0.84×) |
| prepared-async-manual-transaction-insert | 10.6 / 10.4 (1.01×) | 35.9 / 64.8 (0.55×) |
| native-async-batch-insert | 3.3 / 2.6 (1.23×) | 10.9 / 11.2 (0.97×) |
| raw-sync-full-read | 39.4 / 33.6 (1.17×) | 49.8 / 51.1 (0.97×) |
| raw-async-full-read | 47.6 / 41.4 (1.15×) | 99.6 / 79.3 (1.26×) |
| wide-async-full-read | 212.6 / 199.6 (1.07×) | 224.2 / 205.3 (1.09×) |
| blob-async-read | 32.9 / 26.3 (1.25×) | 67.3 / 26.0 (2.59×) |
| large-async-read | 45.2 / 36.2 (1.25×) | 74.9 / 62.6 (1.20×) |
| large-async-read-frame-gap | 39.8 / 35.2 (1.13×) | 47.2 / 28.9 (1.63×) |
| concurrent-async-point-read | 9.7 / 8.3 (1.17×) | 2.9 / 15.9 (0.18×) |
| native-sync-batch-insert | – / 2.0 | – / 7.2 |

Nitro SQLite is ahead on full reads, prepared reads, BLOBs, raw array reads and the large result, and the longest frame gap while the 100,000-row result loads is shorter. Three results go the other way and are worth profiling. On the Android emulator, prepared-statement inserts inside a transaction were 0.34× (sync) and 0.55× (async). On the iPhone simulator, async point lookups were 0.76× to 0.83×. On the Android emulator, all point lookups in flight at once came out at 0.18×, but its three samples spread from 3 to 19 ms, and the iPhone simulator shows the opposite.

The suite's full screens are in [screenshots/iphone-simulator-suite](screenshots/iphone-simulator-suite) and [screenshots/android-emulator-suite](screenshots/android-emulator-suite). Every run's raw samples and manifest are in [data](data).

## Reproducing the runs

Build a Release app for each platform. The flows in `.argent/e2e` open the original four tests or start the suite, wait for the run to finish and take a screenshot. Each finished run is saved as JSON in the app's documents folder and printed to the log with the `SQLITE_BENCH` prefix.

To measure with batch atomic writes, set `nitroSQLite.enableBatchAtomicWrite` to `true` and add `-DSQLITE_ENABLE_BATCH_ATOMIC_WRITE=1` to `op-sqlite.sqliteFlags` in `package.json`. Expo's project fingerprint does not include these fields, so a cached native build can be reused without them. Rebuild the native app without a build cache, then check the "F2FS batch atomic write" line at the top of the screen.
