# victoria-web

Product UI for **Victoria** (Tidewell founder coaching). This repo is the frontend only.

| Layer | Lives in | Tool |
|---|---|---|
| Chat UI | This repo (`victoria-web`) | Lovable → GitHub |
| Coaching API, finance math, Claude, case data | Sibling repo `victoria` | Cursor |

Do **not** connect Lovable GitHub sync to the `victoria` backend repo — it would overwrite `server/`, `knowledge/`, and `workspace/`.

## Connect to Lovable

1. Create an empty GitHub repository named `victoria-web` (or push this folder to one you own).
2. In [Lovable](https://lovable.dev), create or open a project and **connect that GitHub repo** (not the backend).
3. Continue designing in Lovable; pull locally to run against the real API (below).
4. Keep API calls in `src/api.ts` — do not move coaching logic into Lovable edge functions.

Lovable’s hosted preview **cannot** reach `http://127.0.0.1:8787` on your machine. Use local `npm run dev` for real sessions, or later a tunnel URL in `VITE_API_URL`.

## Local loop (real coaching)

**Terminal A — backend (Cursor / `victoria` repo):**

```bash
cd ../victoria   # or your path to the backend
python3 -m server
# → http://127.0.0.1:8787
```

**Terminal B — frontend (this repo):**

```bash
cd ../victoria-web
cp .env.example .env   # optional; proxy works without it
npm install
npm run dev
# → http://127.0.0.1:5173
```

With `VITE_API_URL` unset, Vite proxies `/api/*` to `http://127.0.0.1:8787`. Or set:

```bash
VITE_API_URL=http://127.0.0.1:8787
```

## API used by this UI

| Method | Path | Body | Purpose |
|---|---|---|---|
| `GET` | `/api/meta` | — | Provider, model, investor profiles |
| `POST` | `/api/sessions` | `{}` | Start session; returns opening + `session_id` |
| `POST` | `/api/sessions/{id}/messages` | `{ "text": "..." }` | Send a founder message |
| `GET` | `/api/sessions/{id}` | — | Optional: load session history |

Contract details live in the backend README (`victoria`).

## Success check

1. Start session → task menu.
2. Send `1` → funding-stage pack (with public-resource citations).
3. Follow-ups use Claude when `ANTHROPIC_API_KEY` is set in the backend `.env`.
4. Backend edits: restart `python3 -m server` only; no frontend rebuild required for logic changes.
