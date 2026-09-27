/**
 * JARVIS Rolling Transcript Buffer (120-Second Memory Window)
 * Lonaliza Sovereign Cyber Operating System
 *
 * Keeps a continuous circular temporal buffer of spoken dialogue,
 * enabling contextual recall of recent conversation before any directive.
 */

export interface TranscriptSnippet {
  id: string;
  speaker: "user" | "jarvis" | "agent";
  text: string;
  timestamp: number; // Unix epoch ms
  locale: string;
}

export class RollingTranscriptBuffer {
  private buffer: TranscriptSnippet[] = [];
  private maxDurationMs: number;

  constructor(maxDurationSeconds = 120) {
    this.maxDurationMs = maxDurationSeconds * 1000;
  }

  /**
   * Adds a new transcript chunk and purges snippets older than the window
   */
  public push(
    speaker: "user" | "jarvis" | "agent",
    text: string,
    locale = "ar",
    timestamp = Date.now()
  ): TranscriptSnippet {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        id: "",
        speaker,
        text: "",
        timestamp,
        locale,
      };
    }

    const snippet: TranscriptSnippet = {
      id: `snip_${timestamp}_${Math.random().toString(36).slice(2, 7)}`,
      speaker,
      text: trimmed,
      timestamp,
      locale,
    };

    this.buffer.push(snippet);
    this.prune(timestamp);
    return snippet;
  }

  /**
   * Prunes items older than maxDurationMs from the reference timestamp
   */
  private prune(currentTime = Date.now()): void {
    const cutoff = currentTime - this.maxDurationMs;
    this.buffer = this.buffer.filter((item) => item.timestamp >= cutoff);
  }

  /**
   * Returns all items currently in the rolling window
   */
  public getWindow(windowSeconds?: number): TranscriptSnippet[] {
    const now = Date.now();
    const duration = windowSeconds ? windowSeconds * 1000 : this.maxDurationMs;
    const cutoff = now - duration;
    return this.buffer.filter((item) => item.timestamp >= cutoff);
  }

  /**
   * Returns a formatted text summary for prompt injection
   */
  public getFormattedContext(windowSeconds = 120): string {
    const snippets = this.getWindow(windowSeconds);
    if (snippets.length === 0) return "";

    return snippets
      .map((s) => {
        const timeStr = new Date(s.timestamp).toISOString().substring(11, 19);
        const speakerTag = s.speaker === "user" ? "[OPERATOR]" : s.speaker === "jarvis" ? "[JARVIS]" : "[AGENT]";
        return `${timeStr} ${speakerTag}: ${s.text}`;
      })
      .join("\n");
  }

  /**
   * Clears the rolling buffer
   */
  public clear(): void {
    this.buffer = [];
  }

  /**
   * Returns the count of snippets in buffer
   */
  public size(): number {
    this.prune();
    return this.buffer.length;
  }
}

// Global singleton instance for the live HUD session
export const globalTranscriptBuffer = new RollingTranscriptBuffer(120);
