// Thin client for the Victoria backend (runs separately, from Cursor).
// Falls back to a local demo when the backend is unreachable.

export type Meta = {
  ok: boolean;
  provider: string;
  model: string | null;
  company_id?: string;
  profiles?: { id: string; name: string }[];
  persistence?: string;
};

export type Calculation = Record<string, unknown>;

export type SessionReply = {
  session_id: string;
  message: string;
  mode: string;
  task: string | null;
  topic?: string;
  provider?: string;
  model?: string;
  calculations?: Calculation[];
  calculations_withheld?: boolean;
};

const BASE = (import.meta.env["VITE_API_URL"] ?? "http://127.0.0.1:8787").replace(/\/$/, "");

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data as T;
}

export const apiBase = BASE;

export async function getMeta(): Promise<Meta> {
  return readJson(await fetch(`${BASE}/api/meta`, { signal: AbortSignal.timeout(4000) }));
}

export async function createSession(): Promise<SessionReply> {
  return readJson(
    await fetch(`${BASE}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  );
}

export async function sendMessage(sessionId: string, text: string): Promise<SessionReply> {
  return readJson(
    await fetch(`${BASE}/api/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  );
}

// ---------- Demo mode (no backend) ----------
const MENU =
  "I'm Victoria. What do you want to work on?\n\n" +
  "1. Figure out what funding stage you are at\n" +
  "2. Understand financial numbers\n" +
  "3. Analyze pitch deck\n" +
  "4. Simulate investor meeting";

export const demo = {
  meta: (): Meta => ({ ok: true, provider: "demo", model: "offline", persistence: "none" }),
  create: (): SessionReply => ({
    session_id: "demo",
    message: MENU,
    mode: "chooser",
    task: null,
    topic: "orientation",
  }),
  send: (text: string): SessionReply => {
    const t = text.trim();
    if (t === "4")
      return {
        session_id: "demo",
        mode: "investor",
        task: "investor_meeting",
        message:
          "I'll play a seed investor. Tell me how you calculate ARR. (Demo mode — start your backend for real coaching.)",
        calculations_withheld: true,
      };
    if (/feedback/i.test(t))
      return {
        session_id: "demo",
        mode: "investor",
        task: "investor_meeting",
        message: "Demo feedback: lead with the number, then the method, then the weak spot. Keep the ask specific.",
      };
    return {
      session_id: "demo",
      mode: "chooser",
      task: null,
      message: `This is demo mode, so I can't really coach yet. Start the backend with \`python3 -m server\`.\n\n${MENU}`,
    };
  },
};
