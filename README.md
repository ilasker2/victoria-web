# victoria-web

Product UI for **Victoria** (Tidewell founder coaching). Frontend only.

| Layer | Repo | Tool |
|---|---|---|
| Chat UI | This repo | Lovable ↔ GitHub (two-way on `main`) |
| Coaching API | Sibling `victoria` (Cursor) | `python3 -m server` on `:8787` |

## Lovable + GitHub (correct direction)

Lovable **cannot** attach an existing GitHub repository. Connecting GitHub **creates a new private repo** from the Lovable project; then the two stay in sync both ways.

Recommended path:

1. Build / iterate the UI **in Lovable**.
2. **Project settings → Git → Connect GitHub** → new repo created.
3. Clone that repo in Cursor next to the `victoria` backend.
4. Local edits: push to `main` → appears in Lovable. Lovable edits → appear on GitHub / pull locally.

If you already have scaffold files (Vite chat + `src/api.ts`):

- Download/ZIP and attach in Lovable so it rebuilds into its stack (often **TanStack Start**), **then** Connect GitHub; or
- Connect GitHub first, copy files into the new clone, push — Lovable picks up the push (may need stack adjustments).

**Never** connect Lovable to the Cursor `victoria` backend repo.

## Wire to the Cursor backend

Full pasteable contract: in the backend repo see [`LOVABLE_HANDOFF.md`](../victoria/LOVABLE_HANDOFF.md) (or copy from the `victoria` folder on disk).

| Call | Request |
|---|---|
| Meta | `GET http://127.0.0.1:8787/api/meta` |
| Start | `POST http://127.0.0.1:8787/api/sessions` body `{}` |
| Message | `POST http://127.0.0.1:8787/api/sessions/{id}/messages` body `{ "text": "..." }` |

Set `VITE_API_URL=http://127.0.0.1:8787` (or proxy `/api` → that host). Lovable **cloud preview cannot** reach localhost — test real sessions with the local loop below.

## Layout (Lovable / TanStack)

| Path | Role |
|---|---|
| `src/lib/victoria-api.ts` | Backend client + offline demo |
| `src/routes/index.tsx` | Chat UI (file route `/`) |
| `src/routes/__root.tsx` | Root layout |
| `src/styles.css` | Tailwind theme tokens |

## Local loop

```bash
# Terminal A — Cursor backend
cd /path/to/victoria
python3 -m server
# → http://127.0.0.1:8787

# Terminal B — this frontend (Lovable-synced clone)
cd /path/to/victoria-web
cp .env.example .env   # VITE_API_URL=http://127.0.0.1:8787
npm install
npm run dev
# → http://127.0.0.1:5173
```

## Success check

1. Start session → task menu from the API.
2. Send `1` → funding-stage pack (backend citations).
3. Follow-ups use Claude when the backend `.env` has `ANTHROPIC_API_KEY`.
4. Backend-only changes: restart `python3 -m server`; no Lovable redeploy for logic.
