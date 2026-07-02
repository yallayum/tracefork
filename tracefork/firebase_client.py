from __future__ import annotations

import firebase_admin
from firebase_admin import firestore

from tracefork.config import get_settings

_app: firebase_admin.App | None = None


def get_firestore_client():
    global _app
    settings = get_settings()

    if _app is None:
        try:
            _app = firebase_admin.get_app()
        except ValueError:
            # Emulator mode does not require a service account.
            _app = firebase_admin.initialize_app(options={"projectId": settings.project_id})

    return firestore.client()


def collection(name: str):
    return get_firestore_client().collection(name)
