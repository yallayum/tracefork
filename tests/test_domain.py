from __future__ import annotations

import pytest

from tracefork.integrity import apply_hash_chain, verify_hash_chain
from tracefork.repository import InMemoryRepository
from tracefork.service import TraceForkService


@pytest.fixture
def service() -> TraceForkService:
    return TraceForkService(InMemoryRepository())


def test_happy_trace(service: TraceForkService) -> None:
    result = service.trace_batch("LOT-2026-0421")
    assert result["found"] is True
    assert result["compliance"]["score"] >= 90
    assert result["cold_chain"]["status"] == "PASS"
    assert result["integrity"]["valid"] is True
    assert len(result["timeline"]) == 7


def test_recall_critical(service: TraceForkService) -> None:
    result = service.run_recall("LOT-2026-0421", "dubai_plant", "listeria risk")
    assert result["allowed"] is True
    assert result["severity"] == "CRITICAL"
    assert result["requires_human_approval"] is True
    assert len(result["retail_impacts"]) == 3


def test_cold_chain_violation(service: TraceForkService) -> None:
    result = service.trace_batch("LOT-2026-0315")
    assert result["cold_chain"]["status"] == "FAIL"
    assert len(result["cold_chain"]["violations"]) >= 1


def test_incomplete_trace_blocks_recall(service: TraceForkService) -> None:
    trace = service.trace_batch("LOT-2026-0199")
    assert trace["trace_gap"] is True
    recall = service.run_recall("LOT-2026-0199", "istanbul_cannery", "contamination")
    assert recall["allowed"] is False


def test_unknown_batch(service: TraceForkService) -> None:
    result = service.trace_batch("LOT-9999-UNKNOWN")
    assert result["found"] is False


def test_hash_chain_tamper_detection() -> None:
    repo = InMemoryRepository()
    events = list(repo.get_events("LOT-2026-0421"))
    tampered = [{**events[3], "timestamp": "2099-01-01T00:00:00Z"}]
    tampered_rest = events[:3] + tampered + events[4:]
    report = verify_hash_chain(tampered_rest)
    assert report["valid"] is False


def test_hash_chain_apply_and_verify() -> None:
    raw = [
        {
            "id": "e1",
            "batch_id": "TEST",
            "node_id": "n1",
            "event_type": "harvest",
            "timestamp": "2026-01-01T00:00:00Z",
            "handler": "h",
            "document_ref": "d1",
            "sequence": 1,
        }
    ]
    chained = apply_hash_chain(raw)
    assert verify_hash_chain(chained)["valid"] is True
