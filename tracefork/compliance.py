from __future__ import annotations

from typing import Any


REQUIRED_EVENT_FIELDS = ("node_id", "event_type", "timestamp", "document_ref", "handler")
REQUIRED_BATCH_FIELDS = ("lot_number", "product_id", "production_date", "expiry_date", "quantity_units")


def calculate_compliance_score(
    batch: dict[str, Any],
    events: list[dict[str, Any]],
    shipments: list[dict[str, Any]],
    *,
    has_trace_gap: bool = False,
) -> dict[str, Any]:
    """Score 0-100 based on trace completeness."""
    checks: list[dict[str, Any]] = []
    score = 100.0

    for field in REQUIRED_BATCH_FIELDS:
        present = batch.get(field) not in (None, "")
        checks.append({"field": f"batch.{field}", "ok": present})
        if not present:
            score -= 8

    if not events:
        checks.append({"field": "events", "ok": False})
        score -= 30
    else:
        checks.append({"field": "events", "ok": True})
        for event in events:
            missing = [f for f in REQUIRED_EVENT_FIELDS if not event.get(f)]
            if missing:
                checks.append(
                    {
                        "field": f"event.{event.get('id')}",
                        "ok": False,
                        "missing": missing,
                    }
                )
                score -= 3 * len(missing)

    event_types = {e.get("event_type") for e in events}
    for expected in ("harvest", "process", "shelf"):
        ok = expected in event_types
        checks.append({"field": f"event_type.{expected}", "ok": ok})
        if not ok:
            score -= 5

    if not shipments:
        checks.append({"field": "shipments", "ok": False})
        score -= 10
    else:
        checks.append({"field": "shipments", "ok": True})

    if has_trace_gap:
        checks.append({"field": "trace_gap", "ok": False})
        score -= 25

    score = max(0.0, min(100.0, round(score, 1)))
    if score >= 90:
        grade = "EXCELLENT"
    elif score >= 75:
        grade = "GOOD"
    elif score >= 60:
        grade = "PARTIAL"
    else:
        grade = "INCOMPLETE"

    return {
        "score": score,
        "grade": grade,
        "checks": checks,
        "trace_complete": not has_trace_gap and score >= 75,
    }


def detect_trace_gap(events: list[dict[str, Any]]) -> bool:
    return any((e.get("metadata") or {}).get("trace_gap") for e in events)
