// Single wrapper around the app's LLM provider. Reads keys from .env.local.
// Verda inference (OpenAI-compatible API) is used when VERDA_INFERENCE_API_KEY is set,
// otherwise the Claude API when ANTHROPIC_API_KEY is set.
// Returns null when no key is set or the call fails, so every caller can fall back
// to a deterministic template and the demo keeps working offline.

import Anthropic from "@anthropic-ai/sdk";

export type Provider = "verda" | "claude";

const PROVIDER_LABEL: Record<Provider, string> = { verda: "Verda", claude: "Claude" };
const VERDA_DEFAULT_MODEL = "deepseek-4-1-flash-1017";
const VERDA_DEFAULT_BASE_URL = "https://inference.verda.com/v1";
const CLAUDE_DEFAULT_MODEL = "claude-opus-5-5";

export function activeProvider(): Provider | null {
  if (process.env.VERDA_INFERENCE_API_KEY) return "verda";
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  return null;
}

export function hasApiKey(): boolean {
  return activeProvider() !== null;
}

/** "Verda" or "Claude", or null when AI is off. */
export function providerLabel(): string | null {
  const p = activeProvider();
  return p ? PROVIDER_LABEL[p] : null;
}

export function activeModel(): string | null {
  const p = activeProvider();
  if (p === "verda") return process.env.VERDA_DEFAULT_MODEL || VERDA_DEFAULT_MODEL;
  if (p === "claude") return process.env.ANTHROPIC_MODEL || CLAUDE_DEFAULT_MODEL;
  return null;
}

/**
 * Asks the model for JSON that matches `schema`. Returns the parsed object, or null
 * without a key, on any failure or when a required top-level field is missing, so
 * callers fall back to code. Callers still validate the fields they use.
 */
export async function completeJson<T>(system: string, user: string, schema: Record<string, unknown>): Promise<T | null> {
  const text = await complete(system, user, schema);
  if (!text) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    console.error(`${providerLabel()} API: response was not valid JSON`);
    return null;
  }
  const required = Array.isArray(schema.required) ? (schema.required as string[]) : [];
  if (!parsed || typeof parsed !== "object" || required.some((key) => !(key in parsed))) {
    console.error(`${providerLabel()} API: response is missing required fields`);
    return null;
  }
  return parsed as T;
}

export async function complete(system: string, user: string, jsonSchema?: Record<string, unknown>): Promise<string | null> {
  const p = activeProvider();
  if (p === "verda") return completeVerda(system, user, jsonSchema);
  if (p === "claude") return completeClaude(system, user, jsonSchema);
  return null;
}

// Verda serves open models through an OpenAI-compatible chat completions endpoint.
// JSON mode guarantees a JSON object; the schema itself is given in the prompt.
async function completeVerda(system: string, user: string, jsonSchema?: Record<string, unknown>): Promise<string | null> {
  const base = (process.env.VERDA_BASE_URL || VERDA_DEFAULT_BASE_URL).replace(/\/$/, "");
  const systemPrompt = jsonSchema
    ? `${system}\n\nReturn only a JSON object that matches this JSON Schema:\n${JSON.stringify(jsonSchema)}`
    : system;
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.VERDA_INFERENCE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: activeModel(),
        temperature: 0.2,
        max_tokens: 8000,
        ...(jsonSchema && { response_format: { type: "json_object" } }),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`Verda API error ${response.status}: ${detail.slice(0, 300)}`);
      return null;
    }
    const data = await response.json();
    const choice = data?.choices?.[0];
    if (choice?.finish_reason === "length") {
      console.error("Verda API: response was cut off at max_tokens");
      return null;
    }
    const text = typeof choice?.message?.content === "string" ? choice.message.content.trim() : "";
    return text || null;
  } catch (error) {
    console.error("Verda API call failed", error instanceof Error ? error.message : error);
    return null;
  }
}

let claudeClient: Anthropic | null = null;
async function completeClaude(system: string, user: string, jsonSchema?: Record<string, unknown>): Promise<string | null> {
  try {
    claudeClient ??= new Anthropic();
    const response = await claudeClient.beta.messages.create({
      model: activeModel() ?? CLAUDE_DEFAULT_MODEL,
      max_tokens: 16000,
      // Server-side fallback: if the model declines, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: jsonSchema ? { effort: "low", format: { type: "json_schema", schema: jsonSchema } } : { effort: "low" },
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
