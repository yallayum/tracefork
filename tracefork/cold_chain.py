from __future__ import annotations

from typing import Any


def analyze_cold_chain(shipments: list[dict[str, Any]]) -> dict[str, Any]:
    violations: list[dict[str, Any]] = []
    for shipment in shipments:
        limit = shipment.get("cold_chain_limit_c", 4.0)
        max_temp = shipment.get("max_temp_c")
        if max_temp is not None and max_temp > limit:
            violations.append(
                {
                    "shipment_id": shipment.get("id"),
                    "from_node_id": shipment.get("from_node_id"),
                    "to_node_id": shipment.get("to_node_id"),
                    "max_temp_c": max_temp,
                    "limit_c": limit,
                    "note": shipment.get("violation_note")
                    or f"Max temp {max_temp}°C exceeds limit {limit}°C",
                }
            )

    status = "PASS" if not violations else "FAIL"
    risk = "LOW"
    if violations:
        peak = max(v["max_temp_c"] for v in violations)
        if peak >= 8:
            risk = "HIGH"
        elif peak >= 5:
            risk = "MEDIUM"
        else:
            risk = "MEDIUM"

    return {
        "status": status,
        "risk": risk,
        "violations": violations,
        "shipments_checked": len(shipments),
    }
