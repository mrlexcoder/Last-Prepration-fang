# ANC UI — Gemini-style live interface

Light, minimal AI workspace matching the Gemini live UI: sidebar, centered greeting, pill prompt bar, thinking + streaming chat.

## Run

```bash
cd ANC_ui
npm install
npm run dev
```

Open http://localhost:5173 → Sign in → **/app**

## Routes

| Path | Product |
|------|---------|
| `/app` | **ANC AI** — Gemini-style chat |
| `/notebook` | **ANC Notebook** — library home (NotebookLM-style) |
| `/notebook/n/:id` | Notebook workspace (Sources · Chat · Studio) |
| `/login` | Sign in |
| `/signup` | Sign up |

Notebook code lives in `src/notebook-app/` — separate from main chat. See `src/notebook-app/README.md`.

## UI features

- Collapsible sidebar (full) + narrow icon rail
- **What's next, {name}?** home with centered **Ask ANC** pill bar
- Model selector (Flash / Pro / Thinking), mic, send arrow
- Upgrade button (top right)
- Recent threads in sidebar
- Chat view with thinking blocks + streamed replies
- Google blue `#1a73e8` + white / `#f0f4f9` sidebar

## Structure

```
src/components/gemini/   # Layout, sidebar, prompt bar, home
src/pages/GeminiAppPage.tsx
src/store/chatStore.ts   # Threads + thinking simulation
src/data/sample-threads.json
```
