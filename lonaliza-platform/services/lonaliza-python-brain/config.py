"""
Lonaliza Sovereign Python Brain — Global Configuration
Port: 8100 (Internal IPC Bridge)
Enterprise Frameworks: Stanford DSPy + Mem0 + Anthropic MCP + FastEmbed
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PLATFORM_DIR = BASE_DIR.parent.parent
DATA_DIR = Path(os.getenv("BRAIN_DATA_DIR", str(PLATFORM_DIR / "database" / "data" / "brain")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

MEMORY_DB_PATH = DATA_DIR / "memory.db"
FEWSHOT_REGISTRY_PATH = DATA_DIR / "fewshot-registry.json"
PLATFORM_NODES_PATH = DATA_DIR / "platform-nodes.json"
THESAURUS_CLUSTERS_PATH = DATA_DIR / "thesaurus-clusters.json"
INTENT_LEXICON_PATH = DATA_DIR / "intent-lexicon.json"

# Server Configuration
HOST = os.getenv("PYTHON_BRAIN_HOST", "127.0.0.1")
PORT = int(os.getenv("PYTHON_BRAIN_PORT", "8100"))
DEBUG = os.getenv("PYTHON_BRAIN_DEBUG", "false").lower() == "true"

# Admin Panel IPC
ADMIN_PANEL_URL = os.getenv("ADMIN_PANEL_URL", "http://127.0.0.1:3048")
ADMIN_PANEL_API_KEY = os.getenv("ADMIN_PANEL_API_KEY", "lonaliza-internal-brain-key")

# LLM Providers (DSPy & Mem0)
# Supports Local / Claude / OpenAI / LiteLLM proxy
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
DEFAULT_MODEL = os.getenv("BRAIN_DEFAULT_MODEL", "openai/gpt-4o-mini")

# Vector & Embedding Settings
EMBEDDING_MODEL = os.getenv("BRAIN_EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
SIMILARITY_THRESHOLD = float(os.getenv("BRAIN_SIMILARITY_THRESHOLD", "0.55"))
TOP_K_MEMORIES = int(os.getenv("BRAIN_TOP_K_MEMORIES", "5"))
