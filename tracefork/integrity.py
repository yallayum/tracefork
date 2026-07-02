from __future__ import annotations

import hashlib
import json
from typing import Any


GENESIS_HASH = "0" * 64


def _canonical_payload(event: dict[str, Any]) -> dict[str, Any]:
    """Fields included in tamper-evident hash (excludes hash fields)."""
    return {
        "id": event["id"],
        "batch_id": event["batch_id"],
        "node_id": event["node_id"],
        "event_type": event["event_type"],
        "timestamp": event["timestamp"],
        "temperature_c": event.get("temperature_c"),
        "handler": event.get("handler"),
        "document_ref": event.get("document_ref"),
        "sequence": event.get("sequence"),
        "metadata": event.get("metadata") or {},
    }


def compute_event_hash(event: dict[str, Any], prev_hash: str) -> str:
    payload = _canonical_payload(event)
    payload["prev_event_hash"] = prev_hash
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def apply_hash_chain(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return new event dicts ordered by sequence with hash chain applied."""
    ordered = sorted(events, key=lambda e: e.get("sequence", 0))
    chained: list[dict[str, Any]] = []
    prev = GENESIS_HASH
    for event in ordered:
        event_hash = compute_event_hash(event, prev)
        enriched = {**event, "prev_event_hash": prev, "event_hash": event_hash}
        chained.append(enriched)
        prev = event_hash
    return chained


def verify_hash_chain(events: list[dict[str, Any]]) -> dict[str, Any]:
    ordered = sorted(events, key=lambda e: e.get("sequence", 0))
    prev = GENESIS_HASH
    for index, event in enumerate(ordered, start=1):
        stored_prev = event.get("prev_event_hash")
        stored_hash = event.get("event_hash")
        expected_hash = compute_event_hash(event, prev)

        if stored_prev != prev:
            return {
                "valid": False,
                "failed_at_sequence": index,
                "event_id": event.get("id"),
                "reason": "prev_event_hash mismatch (possible tampering)",
            }
        if stored_hash != expected_hash:
            return {
                "valid": False,
                "failed_at_sequence": index,
                "event_id": event.get("id"),
                "reason": "event_hash mismatch (possible tampering)",
            }
        prev = stored_hash

    return {"valid": True, "events_checked": len(ordered)}
