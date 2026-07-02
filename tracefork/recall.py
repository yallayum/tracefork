from __future__ import annotations

from typing import Any

from tracefork.compliance import detect_trace_gap
from tracefork.trace import get_downstream_nodes, get_retail_impacts


SEVERITY_RULES = {
    "dairy": "CRITICAL",
    "meat": "CRITICAL",
    "packaged": "HIGH",
}


def simulate_recall(
    batch: dict[str, Any],
    product: dict[str, Any],
    events: list[dict[str, Any]],
    nodes: dict[str, dict[str, Any]],
    *,
    contamination_node_id: str,
    reason: str,
) -> dict[str, Any]:
    if detect_trace_gap(events):
        return {
            "allowed": False,
            "reason_blocked": (
                "Cannot simulate recall — trace is incomplete (missing distributor handoff). "
                "Complete trace data before recall planning."
            ),
            "severity": None,
        }

    if not any(e.get("node_id") == contamination_node_id for e in events):
        return {
            "allowed": False,
            "reason_blocked": f"Node '{contamination_node_id}' not found in batch events.",
            "severity": None,
        }

    category = product.get("category", "packaged")
    severity = SEVERITY_RULES.get(category, "HIGH")
    downstream = get_downstream_nodes(contamination_node_id, events)
    retail_impacts = get_retail_impacts(contamination_node_id, events, nodes)
    total_units = sum(r["units"] for r in retail_impacts) or batch.get("quantity_units", 0)

    notices = [
        {
            "to": impact["name"],
            "subject": f"URGENT: Product Withdrawal — {batch.get('lot_number')}",
            "body": (
                f"Batch {batch.get('lot_number')} ({product.get('name')}) must be withdrawn. "
                f"Reason: {reason}. Units affected: {impact['units']}."
            ),
        }
        for impact in retail_impacts
    ]

    return {
        "allowed": True,
        "batch_id": batch.get("lot_number"),
        "contamination_node_id": contamination_node_id,
        "reason": reason,
        "severity": severity,
        "requires_human_approval": severity == "CRITICAL",
        "downstream_nodes": downstream,
        "retail_impacts": retail_impacts,
        "units_affected": total_units,
        "stakeholder_notices": notices,
    }
