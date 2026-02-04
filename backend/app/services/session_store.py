import json
import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from app.api.schemas import ChatSession

DEFAULT_TTL_SECONDS = 60 * 60 * 24


@dataclass(frozen=True)
class SessionStoreConfig:
    db_path: Path
    ttl_seconds: int


class ChatSessionStore:
    """Persistencia de sesiones de chat con SQLite."""

    def __init__(self, config: SessionStoreConfig) -> None:
        self._config = config
        self._ensure_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self._config.db_path)

    def _ensure_db(self) -> None:
        self._config.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    session_id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
                """
            )

    def _cleanup_expired(self, conn: sqlite3.Connection) -> None:
        now_iso = datetime.utcnow().isoformat()
        conn.execute("DELETE FROM chat_sessions WHERE expires_at <= ?", (now_iso,))

    def get_session(self, session_id: str) -> Optional[ChatSession]:
        with self._connect() as conn:
            self._cleanup_expired(conn)
            row = conn.execute(
                "SELECT data FROM chat_sessions WHERE session_id = ?", (session_id,)
            ).fetchone()

        if not row:
            return None

        payload = json.loads(row[0])
        return ChatSession.model_validate(payload)

    def save_session(self, session: ChatSession) -> None:
        now = datetime.utcnow()
        session.updated_at = now
        if not session.created_at:
            session.created_at = now

        expires_at = (now + timedelta(seconds=self._config.ttl_seconds)).isoformat()
        payload = json.dumps(session.model_dump(mode="json"))

        with self._connect() as conn:
            self._cleanup_expired(conn)
            conn.execute(
                """
                INSERT INTO chat_sessions (
                    session_id,
                    data,
                    created_at,
                    updated_at,
                    expires_at
                ) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    data=excluded.data,
                    updated_at=excluded.updated_at,
                    expires_at=excluded.expires_at
                """,
                (
                    session.session_id,
                    payload,
                    session.created_at.isoformat(),
                    session.updated_at.isoformat(),
                    expires_at,
                ),
            )


def _load_store_config() -> SessionStoreConfig:
    base_dir = Path(__file__).resolve().parents[1]
    data_dir = base_dir / "data"
    db_path = Path(
        os.getenv("CHAT_SESSION_DB_PATH", str(data_dir / "chat_sessions.db"))
    )
    ttl_seconds = int(os.getenv("CHAT_SESSION_TTL_SECONDS", str(DEFAULT_TTL_SECONDS)))
    return SessionStoreConfig(db_path=db_path, ttl_seconds=ttl_seconds)


store = ChatSessionStore(_load_store_config())
