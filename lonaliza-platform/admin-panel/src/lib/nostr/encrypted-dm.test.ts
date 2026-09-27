import { describe, expect, it } from "vitest";
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { decryptDmText, encryptDmText, encryptVoiceBytes, decryptVoiceBytes } from "./encrypted-dm";

function hex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("NIP-44 private DMs", () => {
  it("round-trips text so only the conversation pair can read it", () => {
    const alice = generateSecretKey();
    const bob = generateSecretKey();
    const alicePub = getPublicKey(alice);
    const bobPub = getPublicKey(bob);
    const cipher = encryptDmText("مرحبا من اسطنبول", bobPub, hex(alice));
    expect(cipher.startsWith("{")).toBe(false);
    expect(decryptDmText(cipher, alicePub, hex(bob))).toBe("مرحبا من اسطنبول");
    expect(() => decryptDmText(cipher, alicePub, hex(generateSecretKey()))).toThrow();
  });

  it("wraps voice bytes so the blossom blob is not plaintext audio", async () => {
    const alice = generateSecretKey();
    const bob = generateSecretKey();
    const alicePub = getPublicKey(alice);
    const bobPub = getPublicKey(bob);
    const pcm = new Uint8Array([1, 2, 3, 4, 5, 9, 8, 7]);
    const { ciphertext, wrappedKey } = await encryptVoiceBytes(pcm, bobPub, hex(alice));
    expect(ciphertext.length).toBeGreaterThan(pcm.length);
    expect(Array.from(ciphertext.slice(0, 8))).not.toEqual(Array.from(pcm));
    const opened = await decryptVoiceBytes(ciphertext, wrappedKey, alicePub, hex(bob));
    expect(Array.from(opened)).toEqual(Array.from(pcm));
  });
});
