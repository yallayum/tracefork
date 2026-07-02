from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from tracefork.config import SEEDS_DIR
from tracefork.firebase_client import collection


def _load_json(name: str) -> list[dict[str, Any]]:
    path = SEEDS_DIR / name
    with path.open(encoding="utf-8") as f:
        return json.load(f)


class TraceRepository:
    """Firestore access layer for TraceFork collections."""

    def get_batch(self, lot_number: str) -> dict[str, Any] | None:
        doc = collection("batches").document(lot_number).get()
        return doc.to_dict() if doc.exists else None

    def list_batches(self) -> list[dict[str, Any]]:
        return [doc.to_dict() for doc in collection("batches").stream()]

    def get_product(self, product_id: str) -> dict[str, Any] | None:
        doc = collection("products").document(product_id).get()
        return doc.to_dict() if doc.exists else None

    def get_node(self, node_id: str) -> dict[str, Any] | None:
        doc = collection("nodes").document(node_id).get()
        return doc.to_dict() if doc.exists else None

    def get_nodes_map(self) -> dict[str, dict[str, Any]]:
        return {doc.id: doc.to_dict() for doc in collection("nodes").stream()}

    def get_events(self, lot_number: str) -> list[dict[str, Any]]:
        docs = (
            collection("batches")
            .document(lot_number)
            .collection("events")
            .order_by("sequence")
            .stream()
        )
        return [doc.to_dict() for doc in docs]

    def get_shipments(self, lot_number: str) -> list[dict[str, Any]]:
        docs = (
            collection("shipments")
            .where("batch_id", "==", lot_number)
            .stream()
        )
        shipments = [doc.to_dict() for doc in docs]
        return sorted(shipments, key=lambda s: s.get("departed_at", ""))

    def load_seeds_from_disk(self) -> dict[str, list[dict[str, Any]]]:
        return {
            "nodes": _load_json("nodes.json"),
            "products": _load_json("products.json"),
            "batches": _load_json("batches.json"),
            "events": _load_json("events.json"),
            "shipments": _load_json("shipments.json"),
            "demo_scenarios": _load_json("demo_scenarios.json"),
        }


class InMemoryRepository:
    """Offline repository for unit tests — loads seed JSON without Firestore."""

    def __init__(self, seeds: dict[str, list[dict[str, Any]]] | None = None):
        from tracefork.integrity import apply_hash_chain

        self._seeds = seeds or TraceRepository().load_seeds_from_disk()
        self._nodes = {n["id"]: n for n in self._seeds["nodes"]}
        self._products = {p["id"]: p for p in self._seeds["products"]}
        self._batches = {b["lot_number"]: b for b in self._seeds["batches"]}
        self._events: dict[str, list[dict[str, Any]]] = {}
        for lot in self._batches:
            raw = [e for e in self._seeds["events"] if e["batch_id"] == lot]
            self._events[lot] = apply_hash_chain(raw)
        self._shipments = self._seeds["shipments"]

    def get_batch(self, lot_number: str) -> dict[str, Any] | None:
        return self._batches.get(lot_number)

    def list_batches(self) -> list[dict[str, Any]]:
        return list(self._batches.values())

    def get_product(self, product_id: str) -> dict[str, Any] | None:
        return self._products.get(product_id)

    def get_node(self, node_id: str) -> dict[str, Any] | None:
        return self._nodes.get(node_id)

    def get_nodes_map(self) -> dict[str, dict[str, Any]]:
        return dict(self._nodes)

    def get_events(self, lot_number: str) -> list[dict[str, Any]]:
        return self._events.get(lot_number, [])

    def get_shipments(self, lot_number: str) -> list[dict[str, Any]]:
        return [s for s in self._shipments if s["batch_id"] == lot_number]

    def load_seeds_from_disk(self) -> dict[str, list[dict[str, Any]]]:
        return self._seeds
