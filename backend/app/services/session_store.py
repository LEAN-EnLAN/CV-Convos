import json
import os
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import aiosqlite
import redis.asyncio as redis
import asyncpg
from app.api.schemas import ChatSession

DEFAULT_TTL_SECONDS = 60 * 60 * 24


class BaseSessionStore(ABC):
    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        pass

    @abstractmethod
    async def save_session(self, session: ChatSession) -> None:
        pass

    @abstractmethod
    async def initialize(self) -> None:
        pass


class SQLiteSessionStore(BaseSessionStore):
    """Persistencia de sesiones de chat con SQLite (async)."""

    def __init__(self, db_path: Path, ttl_seconds: int) -> None:
        self.db_path = db_path
        self.ttl_seconds = ttl_seconds

    async def initialize(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
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
            await db.commit()

    async def _cleanup_expired(self, db: aiosqlite.Connection) -> None:
        now_iso = datetime.utcnow().isoformat()
        await db.execute("DELETE FROM chat_sessions WHERE expires_at <= ?", (now_iso,))
        await db.commit()

    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        async with aiosqlite.connect(self.db_path) as db:
            await self._cleanup_expired(db)
            async with db.execute(
                "SELECT data FROM chat_sessions WHERE session_id = ?", (session_id,)
            ) as cursor:
                row = await cursor.fetchone()

        if not row:
            return None

        payload = json.loads(row[0])
        return ChatSession.model_validate(payload)

    async def save_session(self, session: ChatSession) -> None:
        now = datetime.utcnow()
        session.updated_at = now
        if not session.created_at:
            session.created_at = now

        expires_at = (now + timedelta(seconds=self.ttl_seconds)).isoformat()
        payload = json.dumps(session.model_dump(mode="json"))

        async with aiosqlite.connect(self.db_path) as db:
            await self._cleanup_expired(db)
            await db.execute(
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
            await db.commit()


class RedisSessionStore(BaseSessionStore):
    """Persistencia de sesiones de chat con Redis."""

    def __init__(self, redis_url: str, ttl_seconds: int) -> None:
        self.redis_url = redis_url
        self.ttl_seconds = ttl_seconds
        self.redis: Optional[redis.Redis] = None

    async def initialize(self) -> None:
        if not self.redis:
            self.redis = redis.from_url(self.redis_url, decode_responses=True)

    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        await self.initialize()
        data = await self.redis.get(f"session:{session_id}")
        if not data:
            return None

        payload = json.loads(data)
        return ChatSession.model_validate(payload)

    async def save_session(self, session: ChatSession) -> None:
        await self.initialize()
        now = datetime.utcnow()
        session.updated_at = now
        if not session.created_at:
            session.created_at = now

        payload = json.dumps(session.model_dump(mode="json"))
        await self.redis.set(
            f"session:{session.session_id}", payload, ex=self.ttl_seconds
        )


class PostgresSessionStore(BaseSessionStore):
    """Persistencia de sesiones de chat con PostgreSQL."""

    def __init__(self, dsn: str, ttl_seconds: int) -> None:
        self.dsn = dsn
        self.ttl_seconds = ttl_seconds
        self.pool: Optional[asyncpg.Pool] = None

    async def initialize(self) -> None:
        if not self.pool:
            self.pool = await asyncpg.create_pool(self.dsn)
            async with self.pool.acquire() as conn:
                await conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS chat_sessions (
                        session_id TEXT PRIMARY KEY,
                        data JSONB NOT NULL,
                        created_at TIMESTAMP NOT NULL,
                        updated_at TIMESTAMP NOT NULL,
                        expires_at TIMESTAMP NOT NULL
                    )
                    """
                )
                await conn.execute(
                    "CREATE INDEX IF NOT EXISTS idx_chat_sessions_expires_at ON chat_sessions (expires_at)"
                )

    async def _cleanup_expired(self, conn: asyncpg.Connection) -> None:
        await conn.execute("DELETE FROM chat_sessions WHERE expires_at <= NOW()")

    async def get_session(self, session_id: str) -> Optional[ChatSession]:
        await self.initialize()
        async with self.pool.acquire() as conn:
            await self._cleanup_expired(conn)
            row = await conn.fetchrow(
                "SELECT data FROM chat_sessions WHERE session_id = $1", session_id
            )

        if not row:
            return None

        # asyncpg converts JSONB automatically to dict
        data = row["data"]
        if isinstance(data, str):
            data = json.loads(data)
        return ChatSession.model_validate(data)

    async def save_session(self, session: ChatSession) -> None:
        await self.initialize()
        now = datetime.utcnow()
        session.updated_at = now
        if not session.created_at:
            session.created_at = now

        expires_at = now + timedelta(seconds=self.ttl_seconds)
        payload = session.model_dump(mode="json")

        async with self.pool.acquire() as conn:
            await self._cleanup_expired(conn)
            await conn.execute(
                """
                INSERT INTO chat_sessions (
                    session_id,
                    data,
                    created_at,
                    updated_at,
                    expires_at
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (session_id) DO UPDATE SET
                    data = EXCLUDED.data,
                    updated_at = EXCLUDED.updated_at,
                    expires_at = EXCLUDED.expires_at
                """,
                session.session_id,
                json.dumps(payload),
                session.created_at,
                session.updated_at,
                expires_at,
            )


def _load_store() -> BaseSessionStore:
    store_type = os.getenv("SESSION_STORE_TYPE", "sqlite").lower()
    ttl_seconds = int(os.getenv("CHAT_SESSION_TTL_SECONDS", str(DEFAULT_TTL_SECONDS)))

    if store_type == "redis":
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        return RedisSessionStore(redis_url, ttl_seconds)
    elif store_type in ("postgres", "postgresql"):
        dsn = os.getenv(
            "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"
        )
        return PostgresSessionStore(dsn, ttl_seconds)
    else:
        base_dir = Path(__file__).resolve().parents[1]
        data_dir = base_dir / "data"
        db_path = Path(
            os.getenv("CHAT_SESSION_DB_PATH", str(data_dir / "chat_sessions.db"))
        )
        return SQLiteSessionStore(db_path, ttl_seconds)


store = _load_store()
