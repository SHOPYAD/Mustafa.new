/**
 * Content cutover flags.
 * Unset DISABLE_SYNTHESIZER_PUBLISH means the markdown synthesizer publish path stays off.
 * Official article writes stay on the official pipeline, which is the live content path.
 */
export function isSynthesizerPublishDisabled(): boolean {
  const raw = (process.env.DISABLE_SYNTHESIZER_PUBLISH || "").trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  return true;
}

export function isOfficialContentOnly(): boolean {
  const raw = (process.env.OFFICIAL_CONTENT_ONLY || "").trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  return true;
}
