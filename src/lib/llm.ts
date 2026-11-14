// Single wrapper around the Claude API. Reads ANTHROPIC_API_KEY from .env.local.
// Returns null when no key is set or the call fails, so every caller can fall back
// to a deterministic template and the demo keeps working offline.

import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export async function complete(system: string, user: string): Promise<string | null> {
  if (!hasApiKey()) return null;
  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Server-side fallback: if the model declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (response.stop_reason === "refusal") return null;
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Claude API: invalid API key");
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Claude API: rate limited");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
    } else {
      console.error("Claude API call failed", error);
    }
    return null;
  }
}
