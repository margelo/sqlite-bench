import json
import pathlib


def main():
    root = pathlib.Path(__file__).resolve().parents[1] / "review-artifacts"
    data = json.loads((root / "results-summary.json").read_text())
    current = "nitro-main-45f400c-op-18.2.5"
    latest = current + "-modules-0.37.1"
    blocks = ["**Same-device version comparisons: original full-read workload.** Milliseconds; lower is better. OP remained on 18.1.3 in the first two builds and moved to 18.2.5 with Nitro main.\n",
              "| Device | Nitro version / Modules | OP | Nitro | Expo | Nitro / OP |",
              "|---|---|---:|---:|---:|---:|"]
    for device, name in [("ios", "M4 Pro iOS simulator"), ("android", "Samsung SM-G977B"), ("iPhone 13 Pro", "iPhone 13 Pro")]:
        for revision, label in [("locked-d7c513c", "9.6.0 / 0.36.1"), ("published-9.8.2", "9.8.2 / 0.36.1"), (current, "main / 0.36.1"), (latest, "main / 0.37.1")]:
            values = [lookup(data, revision, device, "original", lib, "select + read props") for lib in ["op-sqlite", "nitro-sqlite", "expo-sqlite"]]
            if not all(value is not None for value in values):
                continue
            blocks.append(f"| {name} | {label} | {values[0]:,.1f} | {values[1]:,.1f} | {values[2]:,.1f} | {values[1] / values[0]:.2f}x |")
    blocks.append("\nThe isolated 9.6.0-to-9.8.2 package change reduced Nitro's full-read median by 40.5% on the simulator and 34.6% on this Android phone. The current-main comparison also changes OP's version, so it is not a Nitro-only experiment.\n")
    for device, name in [("iPhone 13 Pro", "Physical iPhone 13 Pro, iOS 26.5.2"), ("android", "Physical Samsung SM-G977B, Android 12"), ("ios", "M4 Pro host, iPhone 18 Pro simulator, iOS 27")]:
        revision = current if device == "ios" else latest
        modules = "0.36.1" if device == "ios" else "0.37.1"
        if lookup(data, revision, device, "original", "op-sqlite", "sync insert") is None:
            continue
        blocks += [f"**{name}: current-main build, original workloads.** Nitro main 45f400c, OP 18.2.5, Expo 57.0.0, Nitro Modules {modules}.\n",
                   "| Workload | OP, ms | Nitro, ms | Expo, ms | Nitro / OP |",
                   "|---|---:|---:|---:|---:|"]
        for test in ["sync insert", "async insert", "tx insert", "select + read props"]:
            values = [lookup(data, revision, device, "original", lib, test) for lib in ["op-sqlite", "nitro-sqlite", "expo-sqlite"]]
            blocks.append(f"| {test} | {values[0]:,.1f} | {values[1]:,.1f} | {values[2]:,.1f} | {values[1] / values[0]:.2f}x |")
        host = lookup(data, revision, device, "original", "op-sqlite (HostObjects)", "select + read props")
        blocks.append(f"\nOP's creation-only HostObjects workload took {host:,.1f} ms. It does not consume the selected properties.\n")
    tests = [("select-all-250-checksum", "250 full reads, all values consumed"),
             ("prepared-all-250-checksum", "250 prepared full reads, all values consumed"),
             ("select-hosts-250-checksum", "250 HostObjects full reads, all values consumed"),
             ("select-point-1000-checksum", "1,000 indexed point reads"),
             ("prepared-point-1000-checksum", "1,000 prepared indexed point reads"),
             ("tx-sync-1000", "1,000 sync inserts in one transaction"),
             ("tx-prepared-sync-1000", "1,000 prepared sync inserts in one transaction"),
             ("tx-async-1000", "1,000 awaited inserts in one transaction"),
             ("tx-prepared-async-1000", "1,000 prepared awaited inserts in one transaction"),
             ("batch-1000", "One batch of 1,000 inserts")]
    for device in ["iPhone 13 Pro", "android"]:
        if lookup(data, latest, device, "diagnostic", "nitro-sqlite", "prepared-all-250-checksum") is None:
            continue
        blocks += [f"**Supplementary matched-settings tests: {device}.** Current-main build with Nitro Modules 0.37.1, medians of three measured rounds after warmup.\n",
                   "| Workload | OP, ms | Nitro, ms | Expo, ms |",
                   "|---|---:|---:|---:|"]
        for test, label in tests:
            values = [lookup(data, latest, device, "diagnostic", lib, test) for lib in ["op-sqlite", "nitro-sqlite", "expo-sqlite"]]
            cells = [f"{value:,.2f}" if value is not None else "—" for value in values]
            blocks.append(f"| {label} | {' | '.join(cells)} |")
        blocks.append("")
    blocks.append("Prepared statements avoid repeated SQL preparation; they still pay result conversion and per-call scheduling costs. Compare the full-read rows separately from indexed point reads and write loops. A single batch additionally avoids hundreds of JavaScript/native round trips. OP's prepared full reads return HostObjects, so prepared execution need not beat its ordinary plain-object read path when every property is consumed. All ratios describe these workloads; the small samples do not establish significance for modest differences.")
    text = (root / "review-template.md").read_text().replace("{{MEASUREMENTS}}", "\n".join(blocks))
    (root / "review.md").write_text(text)
    print(f"Wrote {root / 'review.md'}")


def lookup(data, revision, device, kind, library, test):
    rows = [row for row in data if (row["revision"], row["device"], row["kind"], row["library"], row["test"]) == (revision, device, kind, library, test)]
    if not rows:
        return None
    return rows[0]["median"]


if __name__ == "__main__":
    main()
