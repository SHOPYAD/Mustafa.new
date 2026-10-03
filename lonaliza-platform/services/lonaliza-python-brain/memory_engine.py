"""
Lonaliza Sovereign Python Brain — Memory Engine (Mem0 + FastEmbed + SQLite)
Supports Episodic, Semantic, and Procedural Memory with Vector Similarity.
"""

import json
import logging
import sqlite3
import time
import uuid
from typing import Any, Dict, List, Optional

import numpy as np

from config import EMBEDDING_MODEL, MEMORY_DB_PATH, SIMILARITY_THRESHOLD, TOP_K_MEMORIES

logger = logging.getLogger("brain.memory")
logging.basicConfig(level=logging.INFO)


class FastEmbeddingService:
    """CPU-optimized local vector embedding engine using FastEmbed with fallback."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name
        self._model = None
        self._initialized = False

    def _init_model(self):
        if not self._initialized:
            try:
                from fastembed import TextEmbedding
                self._model = TextEmbedding(model_name=self.model_name)
                self._initialized = True
                logger.info(f"FastEmbed model {self.model_name} initialized successfully.")
            except Exception as e:
                logger.warning(f"FastEmbed initialization deferred or failed: {e}. Using deterministic semantic projection.")
                self._initialized = True
                self._model = None

    def embed_text(self, text: str) -> np.ndarray:
        self._init_model()
        if self._model is not None:
            try:
                embeddings = list(self._model.embed([text]))
                if embeddings:
                    vec = np.array(embeddings[0], dtype=np.float32)
                    norm = np.linalg.norm(vec)
                    return vec / (norm + 1e-9)
            except Exception as e:
                logger.warning(f"FastEmbed inference error: {e}. Using fallback embedding.")

        # Robust Fallback: Deterministic 384-dim semantic projection
        return self._fallback_embedding(text)

    def _fallback_embedding(self, text: str, dim: int = 384) -> np.ndarray:
        words = text.lower().split()
        vec = np.zeros(dim, dtype=np.float32)
        if not words:
            return vec
        for i, word in enumerate(words):
            h = hash(word)
            idx = abs(h) % dim
            weight = 1.0 / (1.0 + 0.1 * i)
            vec[idx] += weight * (1.0 if h > 0 else -1.0)
            # Add bigram context
            if i > 0:
                bigram_h = hash(f"{words[i-1]}_{word}")
                b_idx = abs(bigram_h) % dim
                vec[b_idx] += weight * 0.7
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec


class MemoryEngine:
    """Lifelong cognitive memory store implementing Mem0 patterns for Lonaliza travel platform."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = str(db_path or MEMORY_DB_PATH)
        self.embedder = FastEmbeddingService()
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    embedding BLOB NOT NULL,
                    metadata_json TEXT,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS procedural_rules (
                    id TEXT PRIMARY KEY,
                    rule_text TEXT NOT NULL,
                    context_pattern TEXT NOT NULL,
                    is_negative_rule INTEGER NOT NULL DEFAULT 0,
                    confidence REAL NOT NULL DEFAULT 1.0,
                    created_at REAL NOT NULL
                )
            """)
            conn.commit()

    def add_memory(
        self,
        user_id: str,
        content: str,
        memory_type: str = "episodic",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Adds a memory item with vector embedding."""
        mem_id = f"mem_{uuid.uuid4().hex[:12]}"
        now = time.time()
        vec = self.embedder.embed_text(content)
        embedding_blob = vec.tobytes()
        meta_str = json.dumps(metadata or {}, ensure_ascii=False)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO memories (id, user_id, memory_type, content, embedding, metadata_json, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (mem_id, user_id, memory_type, content, embedding_blob, meta_str, now, now),
            )
            conn.commit()

        logger.info(f"Added {memory_type} memory for user {user_id}: {content[:60]}...")
        return {
            "id": mem_id,
            "user_id": user_id,
            "memory_type": memory_type,
            "content": content,
            "metadata": metadata or {},
            "created_at": now,
        }

    def search_memory(
        self,
        user_id: Optional[str],
        query: str,
        limit: int = TOP_K_MEMORIES,
        threshold: float = SIMILARITY_THRESHOLD,
        memory_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Vector semantic search in memory database."""
        query_vec = self.embedder.embed_text(query)
        candidates = []

        query_sql = "SELECT id, user_id, memory_type, content, embedding, metadata_json, created_at FROM memories WHERE 1=1"
        params = []
        if user_id:
            query_sql += " AND (user_id = ? OR user_id = 'global')"
            params.append(user_id)
        if memory_type:
            query_sql += " AND memory_type = ?"
            params.append(memory_type)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query_sql, tuple(params))
            rows = cursor.fetchall()

        for row in rows:
            raw_blob = row["embedding"]
            cand_vec = np.frombuffer(raw_blob, dtype=np.float32)
            similarity = float(np.dot(query_vec, cand_vec))
            if similarity >= threshold:
                try:
                    meta = json.loads(row["metadata_json"] or "{}")
                except Exception:
                    meta = {}
                candidates.append({
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "memory_type": row["memory_type"],
                    "content": row["content"],
                    "similarity": round(similarity, 4),
                    "metadata": meta,
                    "created_at": row["created_at"],
                })

        candidates.sort(key=lambda x: x["similarity"], reverse=True)
        return candidates[:limit]

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Synthesizes traveler profile from semantic memories."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT content, metadata_json FROM memories WHERE user_id = ? AND memory_type = 'semantic' ORDER BY created_at DESC LIMIT 50",
                (user_id,),
            )
            rows = cursor.fetchall()

        facts = []
        preferences = {}
        for r in rows:
            facts.append(r["content"])
            try:
                meta = json.loads(r["metadata_json"] or "{}")
                preferences.update(meta)
            except Exception:
                pass

        return {
            "user_id": user_id,
            "total_facts": len(facts),
            "facts": facts,
            "preferences": preferences,
        }

    def add_procedural_rule(
        self,
        rule_text: str,
        context_pattern: str,
        is_negative: bool = False,
        confidence: float = 1.0,
    ) -> Dict[str, Any]:
        """Records a supervisor avoidance rule or operational constraint."""
        rule_id = f"rule_{uuid.uuid4().hex[:10]}"
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO procedural_rules (id, rule_text, context_pattern, is_negative_rule, confidence, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (rule_id, rule_text, context_pattern, 1 if is_negative else 0, confidence, now),
            )
            conn.commit()

        logger.info(f"Recorded procedural rule [{rule_id}]: {rule_text}")
        return {
            "id": rule_id,
            "rule_text": rule_text,
            "context_pattern": context_pattern,
            "is_negative": is_negative,
            "confidence": confidence,
        }

    def get_procedural_rules(self, query: str) -> List[Dict[str, Any]]:
        """Retrieves procedural rules matching the query context."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, rule_text, context_pattern, is_negative_rule, confidence FROM procedural_rules")
            rows = cursor.fetchall()

        matched = []
        q_lower = query.lower()
        for r in rows:
            pattern = (r["context_pattern"] or "").lower()
            if not pattern or pattern in q_lower or any(word in q_lower for word in pattern.split()):
                matched.append({
                    "id": r["id"],
                    "rule_text": r["rule_text"],
                    "context_pattern": r["context_pattern"],
                    "is_negative": bool(r["is_negative_rule"]),
                    "confidence": r["confidence"],
                })
        return matched

    def get_stats(self) -> Dict[str, Any]:
        """Provides statistical overview of memory store."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT memory_type, COUNT(*) as count FROM memories GROUP BY memory_type")
            type_counts = {r["memory_type"]: r["count"] for r in cursor.fetchall()}

            cursor.execute("SELECT COUNT(DISTINCT user_id) as users_count FROM memories")
            users_count = cursor.fetchone()["users_count"]

            cursor.execute("SELECT COUNT(*) as rules_count FROM procedural_rules")
            rules_count = cursor.fetchone()["rules_count"]

        return {
            "total_memories": sum(type_counts.values()),
            "by_type": type_counts,
            "unique_users": users_count,
            "procedural_rules_count": rules_count,
        }
