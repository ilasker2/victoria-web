import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  apiBase,
  createSession,
  demo,
  getMeta,
  sendMessage,
  type Meta,
  type SessionReply,
} from "@/lib/victoria-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Victoria — Funding coach for founders" },
      {
        name: "description",
        content: "Talk with Victoria to find your funding stage, practice pitches and check round math.",
      },
      { property: "og:title", content: "Victoria — Funding coach for founders" },
      {
        property: "og:description",
        content: "Find your funding stage, practice pitches and check round math.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Msg = { role: "user" | "assistant"; text: string; calcs?: SessionReply["calculations"] };
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
    setMsgs((m) => [
      ...m,
      { role: "assistant", text: r.message, calcs: r.calculations_withheld ? undefined : r.calculations },
    ]);
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
    <div className="mx-auto flex h-dvh max-w-3xl flex-col px-4">
      <header className="flex items-center justify-between gap-4 border-b border-border py-5">
        <div>
          <h1 className="font-display text-4xl leading-none text-primary">Victoria</h1>
          <p className="mt-1 text-sm text-muted-foreground">Funding coach for founders</p>
        </div>
        <StatusPill status={demoMode ? "demo" : status} meta={meta} />
      </header>

      <main className="flex-1 overflow-y-auto py-6">
        {!session ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <p className="font-display text-3xl italic text-foreground">What are we raising today?</p>
            {status === "offline" && (
              <p className="max-w-sm text-sm text-muted-foreground">
                Can&apos;t reach the coach at <code className="rounded bg-muted px-1">{apiBase}</code>. Start it with{" "}
                <code className="rounded bg-muted px-1">python3 -m server</code>, or try the demo.
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                disabled={status !== "online" || busy}
                onClick={() => start(false)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Start session
              </button>
              {status === "offline" && (
                <>
                  <button
                    type="button"
                    onClick={check}
                    className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => start(true)}
                    className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
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
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-card text-card-foreground"
                  }`}
                >
                  {m.text}
                  {m.calcs && m.calcs.length > 0 && (
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                      {JSON.stringify(m.calcs, null, 2)}
                    </pre>
                  )}
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
              className="mb-3 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40"
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
              className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Send
            </button>
          </form>
          <button
            type="button"
            onClick={() => start(demoMode)}
            className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            New session
          </button>
        </footer>
      )}
    </div>
  );
}

function StatusPill({ status, meta }: { status: Status | "demo"; meta: Meta | null }) {
  const label =
    status === "online"
      ? `${meta?.provider} · ${meta?.model}`
      : status === "demo"
        ? "Demo mode"
        : status === "checking"
          ? "Connecting…"
          : "Coach offline";
  const dot = status === "online" ? "bg-success" : status === "offline" ? "bg-destructive" : "bg-accent";
  return (
    <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
