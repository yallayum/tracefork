"""TraceFork agent tools — wraps domain service for Gemini function calling."""

from __future__ import annotations

import json
from typing import Any

from tracefork.repository import TraceRepository
from tracefork.service import TraceForkService

_service = TraceForkService(TraceRepository())

TOOL_DECLARATIONS = [
    {
        "name": "trace_batch",
        "description": "Trace a food batch by lot number. Returns timeline, graph, compliance, cold chain.",
        "parameters": {
            "type": "object",
            "properties": {
                "lot_number": {"type": "string", "description": "e.g. LOT-2026-0421"},
            },
            "required": ["lot_number"],
        },
    },
    {
        "name": "simulate_recall",
        "description": "Simulate a product recall from a contamination point node.",
        "parameters": {
            "type": "object",
            "properties": {
                "lot_number": {"type": "string"},
                "contamination_node_id": {"type": "string", "description": "e.g. dubai_plant"},
                "reason": {"type": "string"},
            },
            "required": ["lot_number", "contamination_node_id", "reason"],
        },
    },
    {
        "name": "verify_integrity",
        "description": "Verify tamper-evident hash chain for batch events.",
        "parameters": {
            "type": "object",
            "properties": {"lot_number": {"type": "string"}},
            "required": ["lot_number"],
        },
    },
    {
        "name": "list_batches",
        "description": "List all batches in the traceability database.",
        "parameters": {"type": "object", "properties": {}},
    },
]


def execute_tool(name: str, args: dict[str, Any]) -> str:
    if name == "trace_batch":
        result = _service.trace_batch(args["lot_number"])
    elif name == "simulate_recall":
        result = _service.run_recall(
            args["lot_number"],
            args["contamination_node_id"],
            args.get("reason", "contamination"),
        )
    elif name == "verify_integrity":
        result = _service.verify_integrity(args["lot_number"])
    elif name == "list_batches":
        batches = TraceRepository().list_batches()
        result = {"batches": [b["lot_number"] for b in batches]}
    else:
        result = {"error": f"Unknown tool: {name}"}
    return json.dumps(result, default=str)
