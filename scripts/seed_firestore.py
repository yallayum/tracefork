#!/usr/bin/env python3
"""Seed Firestore with TraceFork demo data (emulator or production)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tracefork.config import get_settings  # noqa: E402
from tracefork.firebase_client import collection, get_firestore_client  # noqa: E402
from tracefork.integrity import apply_hash_chain  # noqa: E402
from tracefork.repository import TraceRepository  # noqa: E402


def _delete_collection(coll_name: str, batch_size: int = 100) -> int:
    db = get_firestore_client()
    coll = db.collection(coll_name)
    deleted = 0
    while True:
        docs = list(coll.limit(batch_size).stream())
        if not docs:
            break
        batch = db.batch()
        for doc in docs:
            if coll_name == "batches":
                for sub in doc.reference.collection("events").stream():
                    batch.delete(sub.reference)
            batch.delete(doc.reference)
            deleted += 1
        batch.commit()
    return deleted


def seed(*, reset: bool = True) -> None:
    settings = get_settings()
    repo = TraceRepository()
    seeds = repo.load_seeds_from_disk()

    print(f"Project: {settings.project_id}")
    print(f"Emulator: {settings.use_emulator} ({settings.emulator_host or 'n/a'})")

    if reset:
        for name in ("nodes", "products", "batches", "shipments", "demo_scenarios"):
            count = _delete_collection(name)
            print(f"  Cleared {name}: {count} docs")

    db = get_firestore_client()
    batch = db.batch()

    for node in seeds["nodes"]:
        batch.set(collection("nodes").document(node["id"]), node)

    for product in seeds["products"]:
        batch.set(collection("products").document(product["id"]), product)

    for item in seeds["batches"]:
        lot = item["lot_number"]
        batch.set(collection("batches").document(lot), item)

    for shipment in seeds["shipments"]:
        batch.set(collection("shipments").document(shipment["id"]), shipment)

    for scenario_doc in seeds["demo_scenarios"]:
        batch.set(collection("demo_scenarios").document(scenario_doc["id"]), scenario_doc)

    batch.commit()
    print(f"  Seeded nodes={len(seeds['nodes'])}, products={len(seeds['products'])}, "
          f"batches={len(seeds['batches'])}, shipments={len(seeds['shipments'])}")

    events_by_lot: dict[str, list] = {}
    for event in seeds["events"]:
        events_by_lot.setdefault(event["batch_id"], []).append(event)

    for lot, raw_events in events_by_lot.items():
        chained = apply_hash_chain(raw_events)
        evt_batch = db.batch()
        for event in chained:
            evt_batch.set(
                collection("batches").document(lot).collection("events").document(event["id"]),
                event,
            )
        evt_batch.commit()
        print(f"  Seeded events for {lot}: {len(chained)} (hash chain applied)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed TraceFork Firestore database")
    parser.add_argument("--no-reset", action="store_true", help="Do not clear existing data")
    args = parser.parse_args()
    seed(reset=not args.no_reset)
    print("Done.")


if __name__ == "__main__":
    main()
