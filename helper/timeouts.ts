/** Shared timeouts (ms) for Playwright actions and Cucumber `setDefaultTimeout`. */
export const timeouts = {
  default: 30_000,
  navigation: 60_000,
  assertion: 20_000,
  /** After deposit/withdraw submit before navigating away. */
  postDepositSubmitBufferMs: 3000,
} as const;

export async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
