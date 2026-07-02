from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tracefork.repository import InMemoryRepository, TraceRepository  # noqa: E402
from tracefork.service import TraceForkService  # noqa: E402

SCENARIOS_DIR = ROOT / "tests" / "scenarios"


def load_scenario(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_scenario(service: TraceForkService, scenario: dict[str, Any]) -> dict[str, Any]:
    lot = scenario["lot_number"]
    action = scenario["action"]
    expect = scenario.get("expect", {})

    if action == "trace":
        result = service.trace_batch(lot)
        checks = _check_trace(result, expect)
    elif action == "recall":
        result = service.run_recall(
            lot,
            scenario["contamination_node_id"],
            scenario.get("reason", "contamination"),
        )
        trace = service.trace_batch(lot)
        checks = _check_recall(result, trace, expect)
    elif action == "integrity":
        result = service.verify_integrity(lot)
        checks = _check_integrity(result, expect)
    else:
        raise ValueError(f"Unknown action: {action}")

    passed = all(c["ok"] for c in checks)
    return {
        "id": scenario.get("id"),
        "name": scenario.get("name"),
        "passed": passed,
        "checks": checks,
        "result": result,
    }


def _check_trace(result: dict[str, Any], expect: dict[str, Any]) -> list[dict[str, Any]]:
    checks: list[dict[str, Any]] = []

    def add(name: str, ok: bool, detail: str = "") -> None:
        checks.append({"name": name, "ok": ok, "detail": detail})

    add("found", result.get("found") == expect.get("found", True))
    if not result.get("found"):
        return checks

    compliance = result.get("compliance", {})
    if "compliance_min" in expect:
        score = compliance.get("score", 0)
        add("compliance_min", score >= expect["compliance_min"], f"score={score}")
    if "compliance_max" in expect:
        score = compliance.get("score", 100)
        add("compliance_max", score <= expect["compliance_max"], f"score={score}")

    cold = result.get("cold_chain", {})
    if "cold_chain_status" in expect:
        add("cold_chain_status", cold.get("status") == expect["cold_chain_status"])
    if "cold_chain_risk" in expect:
        add("cold_chain_risk", cold.get("risk") == expect["cold_chain_risk"])
    if "min_violations" in expect:
        count = len(cold.get("violations", []))
        add("min_violations", count >= expect["min_violations"], f"count={count}")

    integrity = result.get("integrity", {})
    if "integrity_valid" in expect:
        add("integrity_valid", integrity.get("valid") == expect["integrity_valid"])

    if "trace_gap" in expect:
        add("trace_gap", result.get("trace_gap") == expect["trace_gap"])

    if "min_timeline_events" in expect:
        count = len(result.get("timeline", []))
        add("min_timeline_events", count >= expect["min_timeline_events"], f"count={count}")

    if "min_graph_nodes" in expect:
        count = len(result.get("graph", {}).get("nodes", []))
        add("min_graph_nodes", count >= expect["min_graph_nodes"], f"count={count}")

    return checks


def _check_recall(
    result: dict[str, Any],
    trace: dict[str, Any],
    expect: dict[str, Any],
) -> list[dict[str, Any]]:
    checks: list[dict[str, Any]] = []

    def add(name: str, ok: bool, detail: str = "") -> None:
        checks.append({"name": name, "ok": ok, "detail": detail})

    if "allowed" in expect:
        add("allowed", result.get("allowed") == expect["allowed"])
    if expect.get("allowed"):
        if "severity" in expect:
            add("severity", result.get("severity") == expect["severity"])
        if "requires_human_approval" in expect:
            add(
                "requires_human_approval",
                result.get("requires_human_approval") == expect["requires_human_approval"],
            )
        if "min_retail_impacts" in expect:
            count = len(result.get("retail_impacts", []))
            add("min_retail_impacts", count >= expect["min_retail_impacts"], f"count={count}")
        if "min_units_affected" in expect:
            units = result.get("units_affected", 0)
            add("min_units_affected", units >= expect["min_units_affected"], f"units={units}")
    if "trace_gap" in expect:
        add("trace_gap", trace.get("trace_gap") == expect["trace_gap"])
    if "compliance_max" in expect:
        score = trace.get("compliance", {}).get("score", 100)
        add("compliance_max", score <= expect["compliance_max"], f"score={score}")

    return checks


def _check_integrity(result: dict[str, Any], expect: dict[str, Any]) -> list[dict[str, Any]]:
    checks: list[dict[str, Any]] = []

    def add(name: str, ok: bool, detail: str = "") -> None:
        checks.append({"name": name, "ok": ok, "detail": detail})

    if "integrity_valid" in expect:
        add("integrity_valid", result.get("valid") == expect["integrity_valid"])
    if "events_checked_min" in expect:
        count = result.get("events_checked", 0)
        add("events_checked_min", count >= expect["events_checked_min"], f"count={count}")

    return checks


def main() -> int:
    parser = argparse.ArgumentParser(description="Run TraceFork demo scenarios")
    parser.add_argument("--all", action="store_true", help="Run all scenarios")
    parser.add_argument("--scenario", help="Scenario id e.g. scenario_01")
    parser.add_argument(
        "--source",
        choices=("memory", "firestore"),
        default="memory",
        help="Data source (memory=seed JSON, firestore=live/emulator)",
    )
    args = parser.parse_args()

    if args.source == "firestore":
        repo: Any = TraceRepository()
    else:
        repo = InMemoryRepository()

    service = TraceForkService(repo)

    paths = sorted(SCENARIOS_DIR.glob("scenario_*.yaml"))
    if args.scenario:
        paths = [p for p in paths if args.scenario in p.stem]

    if not paths:
        print("No scenarios found.", file=sys.stderr)
        return 1

    results: list[dict[str, Any]] = []
    for path in paths:
        scenario = load_scenario(path)
        outcome = run_scenario(service, scenario)
        results.append(outcome)
        status = "PASS" if outcome["passed"] else "FAIL"
        print(f"[{status}] {outcome['id']} — {outcome['name']}")
        for check in outcome["checks"]:
            mark = "ok" if check["ok"] else "FAIL"
            detail = f" ({check['detail']})" if check.get("detail") else ""
            print(f"       {mark}: {check['name']}{detail}")

    passed = sum(1 for r in results if r["passed"])
    total = len(results)
    print(f"\n{passed}/{total} scenarios passed")
    return 0 if passed == total else 1


if __name__ == "__main__":
    raise SystemExit(main())
