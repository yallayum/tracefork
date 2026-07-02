"""TraceFork REST API — powers web dashboard and agent tools."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tracefork.repository import TraceRepository  # noqa: E402
from tracefork.service import TraceForkService  # noqa: E402

app = FastAPI(title="TraceFork API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_repo = TraceRepository()
_service = TraceForkService(_repo)

DEMO_LOTS = ["LOT-2026-0421", "LOT-2026-0315", "LOT-2026-0199"]


class RecallRequest(BaseModel):
    contamination_node_id: str = Field(..., examples=["dubai_plant"])
    reason: str = Field(default="contamination detected")


class AgentRequest(BaseModel):
    message: str
    lot_number: str | None = None


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "tracefork"}


@app.get("/api/batches")
def list_batches() -> dict[str, Any]:
    batches = _repo.list_batches()
    result = []
    for batch in batches:
        lot = batch["lot_number"]
        product = _repo.get_product(batch["product_id"]) or {}
        trace = _service.trace_batch(lot)
        result.append(
            {
                "lot_number": lot,
                "product_name": product.get("name", ""),
                "category": product.get("category", ""),
                "status": batch.get("status"),
                "compliance_score": trace.get("compliance", {}).get("score"),
                "cold_chain_status": trace.get("cold_chain", {}).get("status"),
                "trace_gap": trace.get("trace_gap", False),
            }
        )
    return {"batches": result, "demo_lots": DEMO_LOTS}


@app.get("/api/trace/{lot_number}")
def trace(lot_number: str) -> dict[str, Any]:
    result = _service.trace_batch(lot_number)
    if not result.get("found"):
        raise HTTPException(status_code=404, detail=result.get("error", "Not found"))
    return result


@app.post("/api/recall/{lot_number}")
def recall(lot_number: str, body: RecallRequest) -> dict[str, Any]:
    result = _service.run_recall(lot_number, body.contamination_node_id, body.reason)
    if not result.get("found", True) and result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/api/integrity/{lot_number}")
def integrity(lot_number: str) -> dict[str, Any]:
    return _service.verify_integrity(lot_number)


@app.get("/api/scenarios")
def scenarios() -> dict[str, Any]:
    return {
        "scenarios": [
            {"id": "scenario_01", "name": "Happy Trace", "lot": "LOT-2026-0421"},
            {"id": "scenario_02", "name": "Recall Simulation", "lot": "LOT-2026-0421"},
            {"id": "scenario_03", "name": "Cold Chain Alert", "lot": "LOT-2026-0315"},
            {"id": "scenario_04", "name": "Incomplete Trace", "lot": "LOT-2026-0199"},
            {"id": "scenario_05", "name": "Tamper Detection", "lot": "LOT-2026-0421"},
        ]
    }


@app.post("/api/scenarios/run-all")
def run_all_scenarios() -> dict[str, Any]:
    proc = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "run_scenario.py"), "--all", "--source", "firestore"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    passed = "5/5 scenarios passed" in proc.stdout
    return {
        "passed": passed,
        "exit_code": proc.returncode,
        "output": proc.stdout,
        "stderr": proc.stderr,
    }


@app.post("/api/agent/chat")
def agent_chat(body: AgentRequest) -> dict[str, Any]:
    from tracefork.agents.orchestrator import run_agent  # noqa: PLC0415

    try:
        reply = run_agent(body.message, lot_number=body.lot_number)
        return {"reply": reply}
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def main() -> None:
    import uvicorn

    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
