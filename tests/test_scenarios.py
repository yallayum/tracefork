from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_all_scenarios_pass_via_runner() -> None:
    proc = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "run_scenario.py"), "--all"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr
    assert "5/5 scenarios passed" in proc.stdout
