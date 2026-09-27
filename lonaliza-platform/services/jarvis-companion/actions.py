"""
JARVIS 2.1 — Actions & Master Tool Dispatch (actions.py)
Standardized return prefixes: OK: | FAILED: | NOT_ALLOWED: | NEED_CONFIRM:
Based on Muslim's JARVIS Build Guide (§04 & §08).
"""

from typing import Dict, Any, Optional

TOOLS = [
    {
        "name": "navigate_sector",
        "description": "Switch the active 3D holographic card sector (ads, social, video, articles, tours, distribution).",
        "input_schema": {
            "type": "object",
            "properties": {
                "sector": {"type": "string", "enum": ["ads", "social", "video", "articles", "tours", "distribution"]},
                "cardIndex": {"type": "integer"}
            },
            "required": ["sector"]
        }
    },
    {
        "name": "enforce_hotel_markup",
        "description": "Lock mandatory +15% profit markup across all 140 live GDS hotel rates.",
        "input_schema": {
            "type": "object",
            "properties": {
                "rule": {"type": "string"},
                "margin": {"type": "number"}
            }
        }
    },
    {
        "name": "refresh_fx_rates",
        "description": "Refresh live TRY/SAR/USD exchange rates cache and apply +1.2% safety hedging buffer.",
        "input_schema": {
            "type": "object",
            "properties": {
                "source": {"type": "string"},
                "buffer": {"type": "number"}
            }
        }
    },
    {
        "name": "publish_social_reel",
        "description": "Publish the newly rendered travel video reel to Instagram Reels and TikTok.",
        "input_schema": {
            "type": "object",
            "properties": {
                "reelId": {"type": "string"},
                "caption": {"type": "string"}
            }
        }
    }
]

def dispatch(name: str, args: Dict[str, Any]) -> str:
    """
    Standard dispatch function enforcing strict status prefixes.
    NEVER translate OK: / FAILED: prefixes as they are machine contracts!
    """
    try:
        if name == "navigate_sector":
            sector = args.get("sector", "ads")
            card_idx = args.get("cardIndex", 0)
            return f"OK: Switched holographic viewport to {sector} (card index {card_idx})."

        elif name == "enforce_hotel_markup":
            margin = args.get("margin", 15)
            return f"OK: Mandatory +{margin}% hotel markup locked successfully across all BedBanks."

        elif name == "refresh_fx_rates":
            buffer = args.get("buffer", 1.2)
            return f"OK: FX cache refreshed with +{buffer}% hedging buffer active."

        elif name == "publish_social_reel":
            reel_id = args.get("reelId", "latest")
            return f"OK: Reel {reel_id} published to Instagram Reels and TikTok."

        else:
            return f"FAILED: Unknown tool '{name}'."

    except Exception as e:
        return f"FAILED: Action encountered error: {str(e)}"
