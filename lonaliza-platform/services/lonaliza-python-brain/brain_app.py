"""
Lonaliza Sovereign Python Brain — Core FastAPI IPC Microservice
Port: 8100
Enterprise Trio: Stanford DSPy 3.4 + Mem0 2.2 + Anthropic MCP + FastEmbed
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config import HOST, PORT
from dspy_engine import DSPyBrainPipeline
from mcp_bridge import MCPToolBridge
from memory_engine import MemoryEngine

logger = logging.getLogger("brain.api")
logging.basicConfig(level=logging.INFO)

# Global instances
memory_engine: Optional[MemoryEngine] = None
dspy_pipeline: Optional[DSPyBrainPipeline] = None
mcp_bridge: Optional[MCPToolBridge] = None
start_time: float = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global memory_engine, dspy_pipeline, mcp_bridge, start_time
    start_time = time.time()
    logger.info("Initializing Sovereign Python Brain...")
    memory_engine = MemoryEngine()
    dspy_pipeline = DSPyBrainPipeline()
    mcp_bridge = MCPToolBridge()
    logger.info("Sovereign Python Brain initialized successfully.")
    yield
    logger.info("Shutting down Sovereign Python Brain...")


app = FastAPI(
    title="Lonaliza Sovereign Python Brain",
    version="2.5.0",
    description="Autonomous AI Reasoning Engine with Stanford DSPy, Mem0, and Anthropic MCP",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request & Response Schemas
# ---------------------------------------------------------------------------

class DeliberationRequest(BaseModel):
    query: str = Field(..., description="User or supervisor query in any dialect")
    user_id: Optional[str] = Field(default="admin_supervisor", description="User or traveler ID")
    conversation_id: Optional[str] = Field(default=None, description="Active session ID")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional caller context")
    include_memories: bool = Field(default=True, description="Recall episodic/semantic memories from Mem0")
    include_rules: bool = Field(default=True, description="Enforce procedural avoidance rules")


class MemoryAddRequest(BaseModel):
    user_id: str = Field(..., description="User or traveler identifier")
    content: str = Field(..., description="Memory statement or fact")
    memory_type: str = Field(default="episodic", description="'episodic', 'semantic', or 'procedural'")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Structured attributes")


class MemorySearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    user_id: Optional[str] = Field(default=None, description="Optional user filter")
    limit: int = Field(default=5, description="Max results")
    threshold: float = Field(default=0.55, description="Cosine similarity cutoff")
    memory_type: Optional[str] = Field(default=None, description="Optional type filter")


class ToolCallRequest(BaseModel):
    tool_name: str = Field(..., description="MCP tool name")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Tool input arguments")


class OptimizationRequest(BaseModel):
    query: str = Field(..., description="Original input query")
    plan: Dict[str, Any] = Field(..., description="Previous deliberation plan")
    correction: str = Field(..., description="Supervisor correction or feedback")
    approved: bool = Field(default=True, description="Whether plan was approved")


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/v1/brain/health")
async def health_check():
    """System health check and engine telemetry."""
    global memory_engine, dspy_pipeline, mcp_bridge, start_time
    mem_stats = memory_engine.get_stats() if memory_engine else {}
    tools_count = len(mcp_bridge.list_tools()) if mcp_bridge else 0
    nodes_count = len(dspy_pipeline.nodes) if dspy_pipeline else 0
    clusters_count = len(dspy_pipeline.clusters) if dspy_pipeline else 0
    exemplars_count = len(dspy_pipeline.fewshot_exemplars) if dspy_pipeline else 0

    return {
        "status": "healthy",
        "service": "lonaliza-python-brain",
        "uptime_seconds": round(time.time() - start_time, 2),
        "frameworks": {
            "dspy": "3.4.0",
            "mem0": "2.2.1",
            "fastembed": "0.8.1",
            "mcp": "official",
        },
        "telemetry": {
            "platform_nodes_indexed": nodes_count,
            "thesaurus_clusters": clusters_count,
            "active_mcp_tools": tools_count,
            "fewshot_exemplars": exemplars_count,
            "memory_store": mem_stats,
        },
        "timestamp": time.time(),
    }


@app.post("/v1/brain/deliberate")
async def deliberate(req: DeliberationRequest):
    """Executes cognitive multi-agent deliberation for any query."""
    global memory_engine, dspy_pipeline

    if not dspy_pipeline or not memory_engine:
        raise HTTPException(status_code=503, detail="Brain engines are not initialized yet")

    # Step 1: Memory recall
    memories = []
    if req.include_memories and req.user_id:
        memories = memory_engine.search_memory(user_id=req.user_id, query=req.query, limit=4)

    # Step 2: Procedural rules retrieval
    rules = []
    if req.include_rules:
        rules = memory_engine.get_procedural_rules(query=req.query)

    # Step 3: DSPy deliberation
    deliberation_result = dspy_pipeline.deliberate(
        query=req.query,
        user_id=req.user_id,
        traveler_memories=memories,
        procedural_rules=rules,
    )

    # Step 4: Lifelong episodic memory record (Non-blocking)
    try:
        cluster_id = deliberation_result["intent"]["primary_cluster"]
        memory_engine.add_memory(
            user_id=req.user_id or "anonymous",
            content=f"User asked: '{req.query}'. Deliberated into cluster: '{cluster_id}'.",
            memory_type="episodic",
            metadata={
                "cluster": cluster_id,
                "safety": deliberation_result["safety_status"],
                "target_nodes": deliberation_result["target_platform_nodes"][:3],
            },
        )
    except Exception as e:
        logger.warning(f"Failed to record episodic trace: {e}")

    return {
        "status": "ok",
        "deliberation": deliberation_result,
        "memories_recalled": memories,
        "procedural_rules_applied": rules,
    }


@app.post("/v1/brain/memory/add")
async def add_memory(req: MemoryAddRequest):
    """Adds a new fact, interaction, or rule to the lifelong memory engine."""
    global memory_engine
    if not memory_engine:
        raise HTTPException(status_code=503, detail="Memory engine not initialized")

    result = memory_engine.add_memory(
        user_id=req.user_id,
        content=req.content,
        memory_type=req.memory_type,
        metadata=req.metadata,
    )
    return {"status": "ok", "memory": result}


@app.post("/v1/brain/memory/search")
async def search_memory(req: MemorySearchRequest):
    """Vector search across episodic, semantic, and procedural memories."""
    global memory_engine
    if not memory_engine:
        raise HTTPException(status_code=503, detail="Memory engine not initialized")

    results = memory_engine.search_memory(
        user_id=req.user_id,
        query=req.query,
        limit=req.limit,
        threshold=req.threshold,
        memory_type=req.memory_type,
    )
    return {"status": "ok", "query": req.query, "results": results, "count": len(results)}


@app.get("/v1/brain/memory/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Synthesizes user travel profile from lifelong semantic memory."""
    global memory_engine
    if not memory_engine:
        raise HTTPException(status_code=503, detail="Memory engine not initialized")

    profile = memory_engine.get_user_profile(user_id=user_id)
    return {"status": "ok", "profile": profile}


@app.post("/v1/brain/tools/call")
async def call_tool(req: ToolCallRequest):
    """Safe execution of platform tools via Anthropic MCP Bridge."""
    global mcp_bridge
    if not mcp_bridge:
        raise HTTPException(status_code=503, detail="MCP tool bridge not initialized")

    result = await mcp_bridge.execute_tool(req.tool_name, req.arguments)
    return {"status": "ok", "result": result}


@app.get("/v1/brain/tools")
async def list_tools():
    """Lists all registered MCP tools and their JSON schemas."""
    global mcp_bridge
    if not mcp_bridge:
        raise HTTPException(status_code=503, detail="MCP tool bridge not initialized")

    return {"status": "ok", "tools": mcp_bridge.list_tools()}


@app.post("/v1/brain/optimize")
async def optimize(req: OptimizationRequest):
    """MIPROv2 Auto-Optimization: incorporates supervisor feedback to refine future responses."""
    global dspy_pipeline, memory_engine
    if not dspy_pipeline or not memory_engine:
        raise HTTPException(status_code=503, detail="Brain engines not initialized")

    # Record exemplar in DSPy registry
    opt_result = dspy_pipeline.record_supervisor_feedback(
        query=req.query,
        plan=req.plan,
        correction=req.correction,
        approved=req.approved,
    )

    # Also record procedural avoidance/enforcement rule in memory
    rule_result = memory_engine.add_procedural_rule(
        rule_text=req.correction,
        context_pattern=req.query,
        is_negative=not req.approved,
        confidence=1.0,
    )

    return {
        "status": "ok",
        "optimization": opt_result,
        "rule_created": rule_result,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("brain_app:app", host=HOST, port=PORT, reload=False, log_level="info")
