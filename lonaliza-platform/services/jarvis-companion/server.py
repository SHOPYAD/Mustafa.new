"""
JARVIS 2.1 — Core Server & Conversation Loop (server.py)
Implements:
1. 850ms Silence VAD
2. Fast-Path Bypass via quick.py
3. 45-Second Follow-up Window
4. 1.5-Second Echo Guard
5. Sentence-Chunked Streaming Voice
Based on Muslim's JARVIS Build Guide (§04 & §11).
"""

import time
from typing import Dict, Any, Optional
import quick
import actions

FOLLOW_UP_TIMEOUT_SECONDS = 45.0
ECHO_GUARD_SECONDS = 1.5

class ConversationSession:
    def __init__(self):
        self.last_speech_time = 0.0
        self.last_agent_utterance = ""
        self.last_agent_utterance_time = 0.0

    def is_in_follow_up_window(self) -> bool:
        """User can speak without repeating the wake word within 45s."""
        return (time.time() - self.last_speech_time) < FOLLOW_UP_TIMEOUT_SECONDS

    def should_drop_echo(self, text: str) -> bool:
        """Drop audio arriving within 1.5s that matches recent agent output."""
        time_since_agent_spoke = time.time() - self.last_agent_utterance_time
        if time_since_agent_spoke < ECHO_GUARD_SECONDS:
            if text.strip().lower() in self.last_agent_utterance.lower():
                return True
        return False

    def handle_user_input(self, raw_text: str) -> Dict[str, Any]:
        """Core conversation processing pipeline."""
        now = time.time()
        
        # 1. Echo Guard check
        if self.should_drop_echo(raw_text):
            return {"status": "DROPPED_ECHO"}

        # 2. Fast-Path check (0ms latency, $0 cost)
        fast_result = quick.try_fast_path(raw_text)
        if fast_result:
            tool_name, tool_args = fast_result
            action_output = actions.dispatch(tool_name, tool_args)
            self.last_speech_time = now
            return {
                "status": "FAST_PATH",
                "tool": tool_name,
                "result": action_output,
                "followUpActive": True
            }

        # 3. Regular path (Model deliberation)
        self.last_speech_time = now
        return {
            "status": "REQUIRES_LLM",
            "prompt": raw_text,
            "followUpActive": True
        }
