"""
JARVIS 2.1 — Fast-Path Router (quick.py)
Matches unmistakable voice commands using regex in 0ms without invoking expensive LLMs.
Based on Muslim's JARVIS Build Guide (§04 & §08).
"""

import re
from typing import Callable, Tuple, Dict, Any, Optional

RULES: list[Tuple[re.Pattern, Callable[[re.Match], Tuple[str, Dict[str, Any]]]]] = [
    # 1. Navigation & View Switchers
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:الإعلانات|الحملات|اعلانات|ادز)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "ads", "cardIndex": 0}),
    ),
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:السوشيال|سوشيال\s*ميديا|انستقرام|تيك\s*توك)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "social", "cardIndex": 1}),
    ),
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:الفيديو|الريلز|استوديو\s*الفيديو)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "video", "cardIndex": 2}),
    ),
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:المقالات|السيو|المدونة|مقالات\s*السفر)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "articles", "cardIndex": 3}),
    ),
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:البكجات|الرحلات|البرامج|الجولات)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "tours", "cardIndex": 4}),
    ),
    (
        re.compile(r"^(?:افتح|اظهر|شغل|اعرض)\s+(?:الفنادق|الموزعين|الطيران|الاسعار|الخزينة)\b", re.I),
        lambda m: ("navigate_sector", {"sector": "distribution", "cardIndex": 5}),
    ),

    # 2. Direct Operational Actions (Instant Execution)
    (
        re.compile(r"^(?:اقفل|قفل|ثبت)\s+(?:هامش|مارك\s*اب)\s+(?:الفنادق|الفندق)\b", re.I),
        lambda m: ("enforce_hotel_markup", {"rule": "hmk_default_all_15", "margin": 15}),
    ),
    (
        re.compile(r"^(?:حدث|تحديث)\s+(?:كاش|اسعار)\s+(?:الصرف|العملات|الليرة)\b", re.I),
        lambda m: ("refresh_fx_rates", {"source": "Iyzico & Central Bank", "buffer": 1.2}),
    ),
    (
        re.compile(r"^(?:اطلق|انشر|شغل)\s+(?:التدفق|الاوفر)\s+(?:الحالي|الان)\b", re.I),
        lambda m: ("run_active_blueprint", {}),
    ),
]

def try_fast_path(text: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    """Check text against regex rules. Returns (tool_name, args) or None."""
    cleaned = text.strip()
    for pattern, handler in RULES:
        match = pattern.search(cleaned)
        if match:
            return handler(match)
    return None
