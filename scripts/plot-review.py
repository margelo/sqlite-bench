import json
import pathlib

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


def main():
    root = pathlib.Path(__file__).resolve().parents[1] / "review-artifacts"
    data = json.loads((root / "results-summary.json").read_text())
    base = "nitro-main-45f400c-op-18.2.5"
    revisions = [("locked-d7c513c", "Nitro 9.6.0 / Modules 0.36.1"),
                 ("published-9.8.2", "Nitro 9.8.2 / Modules 0.36.1"),
                 (base, "Nitro main / Modules 0.36.1"),
                 (base + "-modules-0.37.1", "Nitro main / Modules 0.37.1")]
    fig, axes = plt.subplots(3, 1, figsize=(13, 8.5), gridspec_kw={"height_ratios": [3, 4, 2]})
    for ax, (device, label) in zip(axes, [("ios", "iOS simulator on Apple M4 Pro"),
                                        ("android", "Samsung SM-G977B, Android 12"),
                                        ("iPhone 13 Pro", "iPhone 13 Pro, iOS 26.5.2")]):
        rows = []
        for revision, title in revisions:
            op = lookup(data, revision, device, "op-sqlite")
            nitro = lookup(data, revision, device, "nitro-sqlite")
            if op is not None and nitro is not None:
                rows.append((title, nitro / op, op, nitro, revision.endswith("0.37.1")))
        for index, (title, ratio, op, nitro, latest) in enumerate(rows):
            ax.barh(index, ratio, height=0.55, color="#7252c7" if latest else "#8491a5")
            ax.text(ratio + 0.08, index, f"{ratio:.2f}x   ({nitro:,.0f} / {op:,.0f} ms)", va="center", fontsize=10)
        ax.set_yticks(range(len(rows)), [r[0] for r in rows], fontsize=10)
        ax.invert_yaxis()
        ax.set_xlim(0, 9.1)
        ax.axvline(1, color="#343b46", linestyle="--", linewidth=1)
        ax.set_title(label, loc="left", fontsize=12, fontweight="bold", pad=10)
        ax.spines[["top", "right", "left"]].set_visible(False)
        ax.tick_params(axis="y", length=0)
        ax.grid(axis="x", alpha=0.15)
        ax.set_axisbelow(True)
    fig.suptitle("Full-read workload: Nitro elapsed time / OP elapsed time", fontsize=17, x=0.03, ha="left", y=0.985)
    axes[-1].set_xlabel("Ratio of median elapsed times; lower is better, 1.0 means equal time", fontsize=11)
    fig.text(0.03, 0.02, "1,000 queries x 1,000 rows, three rounds per build, Release/Hermes. OP 18.1.3 in the first two variants; 18.2.5 with Nitro main.\nDevices are separate comparisons. Native engine collisions affect the iOS build. See the report for versions, controls and limitations.", fontsize=9, color="#49515e")
    fig.subplots_adjust(left=0.29, right=0.97, top=0.92, bottom=0.12, hspace=0.62)
    fig.savefig(root / "read-comparison.png", dpi=180)
    fig.savefig(root / "read-comparison.svg")
    print("Saved read-comparison.png and read-comparison.svg")


def lookup(data, revision, device, library):
    return next((r["median"] for r in data if r["revision"] == revision and r["device"] == device
                 and r["library"] == library and r["kind"] == "original"
                 and r["test"] == "select + read props"), None)


if __name__ == "__main__":
    main()
