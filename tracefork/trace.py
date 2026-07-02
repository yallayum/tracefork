from __future__ import annotations

from typing import Any


NODE_TYPE_ORDER = {"farm": 0, "plant": 1, "warehouse": 2, "retail": 3}


def build_supply_chain_graph(
    events: list[dict[str, Any]],
    nodes: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    ordered = sorted(events, key=lambda e: e.get("sequence", 0))
    graph_nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    seen: set[str] = set()

    for event in ordered:
        node_id = event["node_id"]
        if node_id not in seen:
            node = nodes.get(node_id, {"id": node_id, "name": node_id})
            graph_nodes.append(
                {
                    "id": node_id,
                    "name": node.get("name", node_id),
                    "type": node.get("type", "unknown"),
                    "city": node.get("city"),
                    "country": node.get("country"),
                }
            )
            seen.add(node_id)

    for prev, curr in zip(ordered, ordered[1:]):
        edges.append(
            {
                "from": prev["node_id"],
                "to": curr["node_id"],
                "event_type": curr.get("event_type"),
                "timestamp": curr.get("timestamp"),
            }
        )

    return {
        "nodes": graph_nodes,
        "edges": edges,
        "hop_count": len(edges),
    }


def build_timeline(events: list[dict[str, Any]], nodes: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    ordered = sorted(events, key=lambda e: e.get("sequence", 0))
    timeline: list[dict[str, Any]] = []
    for event in ordered:
        node = nodes.get(event["node_id"], {})
        timeline.append(
            {
                "sequence": event.get("sequence"),
                "event_id": event.get("id"),
                "event_type": event.get("event_type"),
                "node_id": event.get("node_id"),
                "node_name": node.get("name", event.get("node_id")),
                "timestamp": event.get("timestamp"),
                "temperature_c": event.get("temperature_c"),
                "document_ref": event.get("document_ref"),
                "metadata": event.get("metadata") or {},
            }
        )
    return timeline


def get_downstream_nodes(
    contamination_node_id: str,
    events: list[dict[str, Any]],
) -> list[str]:
    ordered = sorted(events, key=lambda e: e.get("sequence", 0))
    downstream: list[str] = []
    found = False
    for event in ordered:
        node_id = event["node_id"]
        if found and node_id not in downstream:
            downstream.append(node_id)
        if node_id == contamination_node_id:
            found = True
    return downstream


def get_retail_impacts(
    contamination_node_id: str,
    events: list[dict[str, Any]],
    nodes: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    downstream = get_downstream_nodes(contamination_node_id, events)
    impacts: list[dict[str, Any]] = []
    for node_id in downstream:
        node = nodes.get(node_id, {})
        if node.get("type") != "retail":
            continue
        units = 0
        for event in events:
            if event.get("node_id") == node_id and event.get("event_type") == "shelf":
                units = (event.get("metadata") or {}).get("units", 0)
        impacts.append(
            {
                "node_id": node_id,
                "name": node.get("name", node_id),
                "units": units,
                "action": "WITHDRAW",
            }
        )
    return impacts
