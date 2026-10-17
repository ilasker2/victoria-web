import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CoachMessage } from "@/components/CoachMessage";
import {
  apiBase,
  createSession,
  demo,
  getMeta,
  sendMessage,
  type Meta,
  type SessionReply,
} from "@/lib/victoria-api";

/** Drop accidental raw JSON (e.g. calculations) appended after the prose. */
function cleanMessage(text: string): string {
  return text.replace(/\n*\s*\[[\s\S]*"metric"\s*:[\s\S]*\]\s*$/m, "").trimEnd();
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Victoria — AI VC | June Analytics" },
      {
        name: "description",
        content:
          "Victoria is an AI VC coach: funding stage and terms insight, financial-statement coaching on your numbers, pitch prep, and investor meeting simulation.",
      },
      { property: "og:title", content: "Victoria — AI VC" },
      {
        property: "og:description",
        content:
          "Funding stage and terms insight, learn your financials, check the deck, and practice investor meetings — so you walk into the room confident.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Msg = { role: "user" | "assistant"; text: string };
type Status = "checking" | "online" | "offline";

function Index() {
  const [status, setStatus] = useState<Status>("checking");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [session, setSession] = useState<SessionReply | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const check = () => {
    setStatus("checking");
    getMeta()
      .then((m) => {
        setMeta(m);
        setStatus("online");
      })
      .catch(() => setStatus("offline"));
  };
  useEffect(check, []);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs, busy]);

  const apply = (r: SessionReply) => {
    setSession(r);
    setMsgs((m) => [...m, { role: "assistant", text: cleanMessage(r.message) }]);
  };

  const start = async (useDemo: boolean) => {
    setError(null);
    setMsgs([]);
    setDemoMode(useDemo);
    if (useDemo) {
      setMeta(demo.meta());
      return apply(demo.create());
    }
    setBusy(true);
    try {
      apply(await createSession());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (value: string) => {
    const t = value.trim();
    if (!t || !session || busy) return;
    setText("");
    setError(null);
    setMsgs((m) => [...m, { role: "user", text: t }]);
    if (demoMode) return apply(demo.send(t));
    setBusy(true);
    try {
      apply(await sendMessage(session.session_id, t));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-4 sm:px-6">
      <header className="flex items-start justify-between gap-4 border-b border-border py-5">
        <div className="flex items-start gap-3">
          <VictoriaAvatar />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                Victoria
              </h1>
              <span className="pill pill-beta">Beta</span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">AI VC</p>
            <p className="pill pill-tagline mt-2">Prepares you the way an investor would</p>
          </div>
        </div>
        <StatusPill status={demoMode ? "demo" : status} meta={meta} />
      </header>

      <main className="flex-1 overflow-y-auto py-6">
        {!session ? (
          <div className="flex h-full flex-col justify-center gap-6 py-4">
            <div className="rounded-[12px] border border-border bg-card p-6 sm:p-8">
              <p className="text-sm font-medium text-muted-foreground">June Analytics · Finance for Founders</p>
              <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Walk into the room confident.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Knows how different VCs think, from YC to a16z and from pre-seed to Series A. She helps you see which
                funding stage fits your numbers and which terms to get clear on before you raise, then coaches you on
                your financial statements, stress-tests the story against the books, and simulates the investor
                meeting — so you walk into the room able to explain your own numbers with confidence.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-foreground/90">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Funding-stage insight from your books, plus plain-language terms (liquidation preference, pro-rata,
                  and the rest) — what they mean and what to ask, not what to sign
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Financial coaching on ARR, growth, margin, and more, using your figures — formula first, then you
                  interpret
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Deck claim checks and investor simulation: flags when the numbers don&apos;t back the story; practices
                  questions the way that investor would ask them
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Outside benchmarks always show their source — and never invent what isn&apos;t in your files
                </li>
              </ul>
              <p className="mt-5 text-sm font-semibold text-foreground">
                Delivers: stage and terms clarity, financial fluency, and meeting prep — so you walk into a room of
                investors confident.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Not investment, legal, or tax advice. Victoria never recommends a valuation, or whether to accept
                specific terms — have counsel review anything you sign.
              </p>
            </div>

            {status === "offline" && (
              <p className="text-sm text-muted-foreground">
                Can&apos;t reach the coach at <code className="rounded-md bg-secondary px-1.5 py-0.5">{apiBase}</code>.
                Start it with <code className="rounded-md bg-secondary px-1.5 py-0.5">python3 -m server</code>, or try
                the demo.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={status !== "online" || busy}
                onClick={() => start(false)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Start session
              </button>
              {status === "offline" && (
                <>
                  <button
                    type="button"
                    onClick={check}
                    className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => start(true)}
                    className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
                  >
                    Try demo
                  </button>
                </>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {msgs.map((m, i) => (
              <div key={i} className={`animate-rise flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-[12px] px-4 py-3 text-[15px] leading-relaxed ${
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
                      : "w-full border border-border bg-card text-card-foreground sm:max-w-[95%]"
                  }`}
                >
                  {m.role === "assistant" ? <CoachMessage text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {busy && <div className="animate-pulse text-sm text-muted-foreground">Victoria is thinking…</div>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div ref={endRef} />
          </div>
        )}
      </main>

      {session && (
        <footer className="border-t border-border py-4">
          {session.mode === "investor" && (
            <button
              type="button"
              onClick={() => send("Please give me feedback")}
              disabled={busy}
              className="mb-3 rounded-full bg-accent-soft px-4 py-1.5 text-xs font-bold text-accent-soft-foreground hover:opacity-90 disabled:opacity-40"
            >
              Ask for feedback
            </button>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
            className="flex gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a menu number or your answer…"
              className="flex-1 rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Send
            </button>
          </form>
          <button
            type="button"
            onClick={() => start(demoMode)}
            className="mt-2 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
          >
            New session
          </button>
        </footer>
      )}
    </div>
  );
}

function VictoriaAvatar() {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-soft-foreground ring-1 ring-border"
      aria-hidden
    >
      V
    </div>
  );
}

function StatusPill({ status, meta }: { status: Status | "demo"; meta: Meta | null }) {
  const label =
    status === "online"
      ? meta?.model
        ? `${meta.provider} · ${meta.model}`
        : meta?.provider || "online"
      : status === "demo"
        ? "Demo mode"
        : status === "checking"
          ? "Connecting…"
          : "Coach offline";
  const dot =
    status === "online" ? "bg-success" : status === "offline" ? "bg-destructive" : "bg-accent";
  return (
    <span className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
