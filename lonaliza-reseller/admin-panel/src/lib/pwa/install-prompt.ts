/**
 * Capture beforeinstallprompt only when the in-app banner will call prompt().
 * Calling preventDefault without a visible install UI leaves Chrome's
 * "Banner not shown" warning and never surfaces the native sheet.
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function shouldCaptureInstallPrompt(input: {
  enabled: boolean;
  showBanner: boolean;
  standalone: boolean;
  dismissed: boolean;
}): boolean {
  return input.enabled && input.showBanner && !input.standalone && !input.dismissed;
}
