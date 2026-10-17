/**
 * Victoria coaching API client.
 * Backend lives in the separate Cursor repo (python3 -m server on :8787).
 *
 * Set VITE_API_URL=http://127.0.0.1:8787 for direct calls, or leave empty
 * to use Vite's /api proxy during local `npm run dev`.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export type Meta = {
  ok: boolean;
  provider: "claude" | "local";
  model: string | null;
  company_id: string;
  profiles: { id: string; name: string }[];
  persistence: string;
};

export type CoachReply = {
  session_id: string;
  message: string;
  mode: string;
  task?: string | null;
  pitch_focus?: string | null;
  numbers_focus?: string | null;
  investor_profile?: string | null;
  topic?: string | null;
  provider?: string;
  model?: string | null;
  calculations?: unknown[];
  calculations_withheld?: boolean;
  help_used?: boolean;
  misunderstandings?: string[];
  practice_results?: unknown[];
  history?: { role: string; content: string }[];
  error?: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || response.statusText);
  }
  return data;
}

function url(path: string): string {
  return `${BASE}${path}`;
}

export async function getMeta(): Promise<Meta> {
  return readJson(await fetch(url("/api/meta")));
}

export async function createSession(body: Record<string, unknown> = {}): Promise<CoachReply> {
  return readJson(
    await fetch(url("/api/sessions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function sendMessage(sessionId: string, text: string): Promise<CoachReply> {
  return readJson(
    await fetch(url(`/api/sessions/${sessionId}/messages`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  );
}

export async function getSession(sessionId: string): Promise<CoachReply> {
  return readJson(await fetch(url(`/api/sessions/${sessionId}`)));
}
