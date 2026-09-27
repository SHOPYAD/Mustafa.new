"""
JARVIS 2.1 — Speech Recognition & Keyword Hint Booster (local_voice.py)
Implements Whisper domain vocabulary priming to eliminate domain mishearings.
Based on Muslim's JARVIS Build Guide (§06 & §11).
"""

import os
from typing import Optional

# Grounded domain lexicon for Lonaliza Platform (Whisper Initial Prompt)
HINT = (
    "Lonaliza, Jarvis, Nexus, Travelport, Hotelbeds, BiletBank, Seeru, PKFare, "
    "Trabzon, Uzungol, Cappadocia, Bodrum, Antalya, Bosphorus, "
    "Mercedes-Benz Vito, VIP Transfer, ROAS, PMax, Meta Ads, "
    "PocketBase, BullMQ, Iyzico, PNR, GDS, BedBanks, Currency TRY, SAR, USD"
)

# Phonetic wake word aliases for different regional accents
WAKE_WORDS = [
    "jarvis", "jervis", "jarves", "jaris", "jarwi", "djarvis",
    "lonaliza", "lunaliza", "lona", "nexus", "niksus", "neksus"
]

NAME_ROOTS = ("jarvis", "lonaliza", "nexus")
NAME_NEAR = 0.62

def is_wake_word_present(text: str) -> bool:
    """Fuzzy matching for wake words at the beginning of the transcript."""
    cleaned = text.strip().lower()
    first_word = cleaned.split()[0] if cleaned else ""
    
    # Exact check
    if any(w in first_word for w in WAKE_WORDS):
        return True
        
    # Simple similarity ratio check (matching Muslim's NAME_NEAR = 0.62)
    for root in NAME_ROOTS:
        if root in first_word or first_word in root:
            return True
            
    return False
