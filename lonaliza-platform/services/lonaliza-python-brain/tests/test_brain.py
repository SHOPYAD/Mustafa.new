"""
Lonaliza Sovereign Python Brain — Pytest Comprehensive Verification Suite
Tests DSPy, Mem0, FastEmbed, MCP Bridge, and FastAPI Endpoints.
"""

import sys
from pathlib import Path

# Add parent directory to path
parent_dir = str(Path(__file__).resolve().parent.parent)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import numpy as np
import pytest
from fastapi.testclient import TestClient

from brain_app import app
from dspy_engine import DSPyBrainPipeline
from mcp_bridge import MCPToolBridge
from memory_engine import MemoryEngine


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check_endpoint(client):
    """Verifies that the brain health endpoint returns status healthy with telemetry."""
    res = client.get("/v1/brain/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "lonaliza-python-brain"
    assert data["frameworks"]["dspy"] == "3.4.0"
    assert data["frameworks"]["mem0"] == "2.2.1"
    assert data["telemetry"]["platform_nodes_indexed"] >= 1000
    assert data["telemetry"]["thesaurus_clusters"] == 26


def test_memory_engine_vector_search(tmp_path):
    """Verifies vector storage and cosine similarity retrieval in Mem0."""
    db_file = tmp_path / "test_memory.db"
    mem = MemoryEngine(db_path=str(db_file))

    # Add memories
    mem.add_memory("user_101", "Client prefers 5-star hotels in Taksim with Bosphorus view", "semantic", {"stars": 5})
    mem.add_memory("user_101", "Client booked flight TK1982 to Istanbul on Emirates", "episodic")
    mem.add_procedural_rule("Always verify passport validity minimum 6 months for Turkey", "turkey visa", False, 1.0)

    # Search
    results = mem.search_memory("user_101", "taksim hotel view", limit=3)
    assert len(results) >= 1
    assert "Taksim" in results[0]["content"]
    assert results[0]["similarity"] > 0.4

    # Profile
    profile = mem.get_user_profile("user_101")
    assert profile["total_facts"] >= 1

    # Rules
    rules = mem.get_procedural_rules("Need turkey visa for passenger")
    assert len(rules) >= 1
    assert "passport validity" in rules[0]["rule_text"]


def test_dspy_dialect_deliberation():
    """Verifies multi-dialect intent classification, entity extraction, and platform node linking."""
    pipeline = DSPyBrainPipeline()

    # Saudi Dialect Test
    saudi_res = pipeline.deliberate("شوف لي فندق كشخة في تقسيم خمس نجوم")
    assert saudi_res["intent"]["primary_cluster"] == "hotels.search"
    assert saudi_res["intent"]["entities"]["dialect"] == "saudi_gulf"
    assert saudi_res["intent"]["entities"]["hotel_stars"] == 5
    assert "istanbul" in saudi_res["intent"]["entities"]["destinations"]
    assert len(saudi_res["target_platform_nodes"]) > 0

    # Levantine Dialect Test
    levant_res = pipeline.deliberate("بدنا سيارة فيتو مع شوفير لبورصة")
    assert levant_res["intent"]["primary_cluster"] == "transfers.private"
    assert levant_res["intent"]["entities"]["dialect"] == "levantine"
    assert levant_res["intent"]["entities"]["vehicle_type"] == "mercedes_vito"
    assert "bursa" in levant_res["intent"]["entities"]["destinations"]

    # Egyptian Dialect Test
    egypt_res = pipeline.deliberate("عاوز احجز طيارة لاسطنبول بكام")
    assert egypt_res["intent"]["primary_cluster"] == "flights.search"
    assert egypt_res["intent"]["entities"]["dialect"] == "egyptian"


def test_mcp_tool_execution():
    """Verifies MCP tool listing and safe execution."""
    import asyncio

    async def _test():
        bridge = MCPToolBridge()
        tools = bridge.list_tools()
        assert len(tools) >= 5

        # Test Pricing Tool
        pricing_res = await bridge.execute_tool(
            "smart_pricing_engine",
            {"base_cost": 150.0, "service_type": "hotel", "channel": "vip", "target_currency": "SAR"},
        )
        assert not pricing_res["is_error"]
        assert pricing_res["output"]["final_price_usd"] > 150.0
        assert pricing_res["output"]["final_price_target"] > 500.0

        # Test Health Check Tool
        health_res = await bridge.execute_tool("health_check", {})
        assert not health_res["is_error"]
        assert health_res["output"]["overall_status"] == "healthy"

    asyncio.run(_test())


def test_api_deliberation_and_optimization_endpoints(client):
    """Verifies the complete FastAPI deliberation and MIPROv2 self-design endpoints."""
    # 1. Deliberate
    delib_res = client.post(
        "/v1/brain/deliberate",
        json={"query": "ابغى حجز فندق فخم في انطاليا مع مسبح خاص", "user_id": "vip_guest_9"},
    )
    assert delib_res.status_code == 200
    d_data = delib_res.json()
    assert d_data["status"] == "ok"
    assert d_data["deliberation"]["intent"]["primary_cluster"] == "hotels.search"
    assert "antalya" in d_data["deliberation"]["intent"]["entities"]["destinations"]

    # 2. Add Memory
    mem_res = client.post(
        "/v1/brain/memory/add",
        json={
            "user_id": "vip_guest_9",
            "content": "Guest loves luxury resorts with private pool in Antalya",
            "memory_type": "semantic",
            "metadata": {"preferred_dest": "antalya"},
        },
    )
    assert mem_res.status_code == 200

    # 3. Optimize (MIPROv2 self-design loop)
    opt_res = client.post(
        "/v1/brain/optimize",
        json={
            "query": "ابغى حجز فندق فخم في انطاليا",
            "plan": d_data["deliberation"],
            "correction": "Always prioritize Maxx Royal or Regnum Carya for VIP guests in Antalya",
            "approved": True,
        },
    )
    assert opt_res.status_code == 200
    assert opt_res.json()["status"] == "ok"
