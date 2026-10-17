import { FormEvent, useEffect, useState } from "react";
import {
  CoachReply,
  createSession,
  getMeta,
  Meta,
  sendMessage,
} from "./api";
import "./App.css";

type ChatItem =
  | { role: "user"; text: string }
  | { role: "assistant"; reply: CoachReply };

export default function App() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaError, setMetaError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMeta()
      .then(setMeta)
      .catch((err: Error) => setMetaError(err.message));
  }, []);

  async function startSession(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const reply = await createSession({});
      setSessionId(reply.session_id);
      setItems([{ role: "assistant", reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !sessionId || busy) return;
    setText("");
    setError("");
    setItems((prev) => [...prev, { role: "user", text: trimmed }]);
    setBusy(true);
    try {
      const reply = await sendMessage(sessionId, trimmed);
      setItems((prev) => [...prev, { role: "assistant", reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function askFeedback() {
    setText("Please give me feedback");
  }

  const lastAssistant = [...items].reverse().find((item) => item.role === "assistant");
  const investorMode =
    lastAssistant?.role === "assistant" && lastAssistant.reply.mode === "investor";

  const status = metaError
    ? `API unreachable: ${metaError}. Start the backend with python3 -m server in the victoria repo.`
    : meta
      ? meta.provider === "claude"
        ? `Claude connected (${meta.model}). Sessions are in-memory only.`
        : "Local coach (no ANTHROPIC_API_KEY). Add the key in the victoria backend .env to use Claude."
      : "Checking API…";

  return (
    <div className="app">
      <header>
        <h1>Victoria</h1>
        <p className="lede">
          Product UI for Tidewell coaching. Logic runs in the Cursor-owned Python API
          (<code>victoria</code> repo). This app is the Lovable / GitHub frontend.
        </p>
        <p className="status">{status}</p>
      </header>

      <main>
        {!sessionId ? (
          <form className="setup" onSubmit={startSession}>
            <button type="submit" disabled={busy || !!metaError}>
              Start session
            </button>
          </form>
        ) : null}

        <div className="log" aria-live="polite">
          {items.map((item, index) =>
            item.role === "user" ? (
              <article key={index} className="bubble user">
                <div className="meta">You</div>
                <div className="body">{item.text}</div>
              </article>
            ) : (
              <article key={index} className="bubble assistant">
                <div className="meta">
                  {(item.reply.provider || "coach") +
                    (item.reply.model ? ` · ${item.reply.model}` : "") +
                    ` · ${item.reply.mode}` +
                    (item.reply.task ? ` · ${item.reply.task}` : "") +
                    (item.reply.topic ? ` · ${item.reply.topic}` : "") +
                    (item.reply.calculations_withheld ? " · calculation held" : "")}
                </div>
                <div className="body">{item.reply.message}</div>
              </article>
            ),
          )}
        </div>

        {error ? <p className="error">{error}</p> : null}

        {sessionId ? (
          <form className="composer" onSubmit={onSend}>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Reply to Victoria (a number works for the menu)"
              disabled={busy}
            />
            <div className="actions">
              <button type="submit" disabled={busy || !text.trim()}>
                Send
              </button>
              {investorMode ? (
                <button type="button" onClick={askFeedback} disabled={busy}>
                  Ask for feedback
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
      </main>
    </div>
  );
}
