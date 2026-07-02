from __future__ import annotations

from typing import Any, Protocol

from tracefork.cold_chain import analyze_cold_chain
from tracefork.compliance import calculate_compliance_score, detect_trace_gap
from tracefork.integrity import verify_hash_chain
from tracefork.recall import simulate_recall
from tracefork.trace import build_supply_chain_graph, build_timeline


class BatchRepository(Protocol):
    def get_batch(self, lot_number: str) -> dict[str, Any] | None: ...
    def get_product(self, product_id: str) -> dict[str, Any] | None: ...
    def get_nodes_map(self) -> dict[str, dict[str, Any]]: ...
    def get_events(self, lot_number: str) -> list[dict[str, Any]]: ...
    def get_shipments(self, lot_number: str) -> list[dict[str, Any]]: ...


class TraceForkService:
    def __init__(self, repo: BatchRepository):
        self._repo = repo

    def trace_batch(self, lot_number: str) -> dict[str, Any]:
        batch = self._repo.get_batch(lot_number)
        if not batch:
            return {"found": False, "lot_number": lot_number, "error": "Batch not found"}

        product = self._repo.get_product(batch["product_id"]) or {}
        events = self._repo.get_events(lot_number)
        shipments = self._repo.get_shipments(lot_number)
        nodes = self._repo.get_nodes_map()
        trace_gap = detect_trace_gap(events)

        return {
            "found": True,
            "lot_number": lot_number,
            "batch": batch,
            "product": product,
            "timeline": build_timeline(events, nodes),
            "graph": build_supply_chain_graph(events, nodes),
            "compliance": calculate_compliance_score(
                batch, events, shipments, has_trace_gap=trace_gap
            ),
            "cold_chain": analyze_cold_chain(shipments),
            "integrity": verify_hash_chain(events),
            "trace_gap": trace_gap,
        }

    def run_recall(
        self,
        lot_number: str,
        contamination_node_id: str,
        reason: str,
    ) -> dict[str, Any]:
        batch = self._repo.get_batch(lot_number)
        if not batch:
            return {"found": False, "error": "Batch not found"}

        product = self._repo.get_product(batch["product_id"]) or {}
        events = self._repo.get_events(lot_number)
        nodes = self._repo.get_nodes_map()
        return simulate_recall(
            batch,
            product,
            events,
            nodes,
            contamination_node_id=contamination_node_id,
            reason=reason,
        )

    def verify_integrity(self, lot_number: str) -> dict[str, Any]:
        events = self._repo.get_events(lot_number)
        if not events:
            return {"valid": False, "reason": "No events found"}
        return verify_hash_chain(events)
