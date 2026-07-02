from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
SEEDS_DIR = ROOT_DIR / "data" / "seeds"

load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    project_id: str
    use_emulator: bool
    emulator_host: str | None
    gemini_api_key: str | None


def get_settings() -> Settings:
    use_emulator = os.getenv("USE_FIRESTORE_EMULATOR", "true").lower() in {
        "1",
        "true",
        "yes",
    }
    emulator_host = os.getenv("FIRESTORE_EMULATOR_HOST")
    if use_emulator and emulator_host:
        os.environ.setdefault("FIRESTORE_EMULATOR_HOST", emulator_host)
        os.environ.setdefault("GCLOUD_PROJECT", os.getenv("GOOGLE_CLOUD_PROJECT", "tracefork-3f5ac"))

    return Settings(
        project_id=os.getenv("GOOGLE_CLOUD_PROJECT", "tracefork-3f5ac"),
        use_emulator=use_emulator,
        emulator_host=emulator_host,
        gemini_api_key=os.getenv("GEMINI_API_KEY"),
    )
