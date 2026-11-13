import collections
import json
import pathlib
import statistics


def main():
    root = pathlib.Path(__file__).resolve().parents[1] / "review-artifacts"
    excluded = set(json.loads((root / "excluded-sessions.json").read_text()))
    excluded_records = json.loads((root / "excluded-records.json").read_text())
    records = [json.loads(p.read_text()) for p in sorted((root / "runs").glob("*.json"))]
    groups = collections.defaultdict(list)
    settings = {}
    errors = []
    for record in records:
        if record["started"] in excluded:
            continue
        if any(record["started"] == item["started"] and record["kind"] == item["kind"] for item in excluded_records):
            continue
        device = "iPhone 13 Pro" if record["platform"] == "ios" and record["isDevice"] else record["platform"]
        if record["kind"] == "error":
            errors.append(record)
            continue
        if record["kind"] == "diagnostic":
            settings[(record["revision"], device, record["library"])] = record
            if record["warmup"]:
                continue
        for result in record.get("results", []):
            library = result.get("label", record.get("library"))
            test = result.get("group", result.get("test"))
            key = (record["revision"], device, record["kind"], library, test)
            groups[key].append(result["ms"])
    summary = []
    for key, values in sorted(groups.items()):
        revision, device, kind, library, test = key
        summary.append(dict(revision=revision, device=device, kind=kind, library=library,
                            test=test, samples=len(values), median=statistics.median(values),
                            minimum=min(values), maximum=max(values), values=values))
    (root / "results-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    (root / "run-errors.json").write_text(json.dumps(errors, indent=2) + "\n")
    metadata = []
    for (revision, device, library), record in sorted(settings.items()):
        metadata.append(dict(revision=revision, device=device, library=library,
                             started=record["started"], versions=record["versions"],
                             defaults=record["defaults"], settings=record["settings"],
                             correctness=record.get("correctness")))
    (root / "connection-metadata.json").write_text(json.dumps(metadata, indent=2) + "\n")
    tables = []
    for revision, device, kind in sorted({(r["revision"], r["device"], r["kind"]) for r in summary}):
        rows = [r for r in summary if (r["revision"], r["device"], r["kind"]) == (revision, device, kind)]
        tables.append(f"**{revision}, {device}, {kind}.** Elapsed milliseconds; median, minimum, maximum.\n")
        tables.append("| Library | Workload | Samples | Median | Min | Max |\n|---|---|---:|---:|---:|---:|")
        for row in rows:
            tables.append(f"| {row['library']} | {row['test']} | {row['samples']} | {row['median']:.2f} | {row['minimum']:.2f} | {row['maximum']:.2f} |")
        tables.append("")
    (root / "all-results.md").write_text("\n".join(tables))
    print(f"Summarized {len(summary)} result groups; {len(errors)} runtime errors.")


if __name__ == "__main__":
    main()
