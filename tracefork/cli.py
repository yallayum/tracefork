"""TraceFork CLI — trace, recall, scenarios, agent chat."""

from __future__ import annotations

import argparse
import json
import sys

from tracefork.agents.orchestrator import run_agent
from tracefork.repository import TraceRepository
from tracefork.service import TraceForkService


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="tracefork", description="TraceFork food traceability CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    trace_p = sub.add_parser("trace", help="Trace a batch by lot number")
    trace_p.add_argument("lot_number")

    recall_p = sub.add_parser("recall", help="Simulate recall")
    recall_p.add_argument("lot_number")
    recall_p.add_argument("--at-node", required=True, dest="node_id")
    recall_p.add_argument("--reason", default="contamination detected")

    sub.add_parser("list", help="List all batches")

    agent_p = sub.add_parser("agent", help="Chat with TraceFork agent")
    agent_p.add_argument("message")
    agent_p.add_argument("--lot", default=None)

    demo_p = sub.add_parser("demo", help="Run demo scenarios")
    demo_p.add_argument("--scenario", default=None)

    args = parser.parse_args(argv)
    service = TraceForkService(TraceRepository())

    if args.command == "trace":
        result = service.trace_batch(args.lot_number)
        print(json.dumps(result, indent=2, default=str))
        return 0 if result.get("found") else 1

    if args.command == "recall":
        result = service.run_recall(args.lot_number, args.node_id, args.reason)
        print(json.dumps(result, indent=2, default=str))
        return 0 if result.get("allowed", False) or not result.get("found", True) else 1

    if args.command == "list":
        for batch in TraceRepository().list_batches():
            print(batch["lot_number"], "-", batch.get("status"))
        return 0

    if args.command == "agent":
        print(run_agent(args.message, lot_number=args.lot))
        return 0

    if args.command == "demo":
        import subprocess
        from pathlib import Path

        root = Path(__file__).resolve().parents[1]
        cmd = [sys.executable, str(root / "scripts" / "run_scenario.py"), "--all", "--source", "firestore"]
        if args.scenario:
            cmd.extend(["--scenario", args.scenario])
        return subprocess.call(cmd, cwd=root)

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
