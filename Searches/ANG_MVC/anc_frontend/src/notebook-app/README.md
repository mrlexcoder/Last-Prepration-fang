# ANC Notebook — separate product module

Like **notebooklm.google.com** vs **gemini.google.com**, this lives apart from main ANC AI chat (`/app`).

## Routes

| URL | Screen |
|-----|--------|
| `/notebook` | Library home (featured + recent) |
| `/notebook/n/:notebookId` | 3-column workspace (Sources · Chat · Studio) |

## Folder structure

```
notebook-app/
├── routes/NotebookApp.tsx      # Nested routes
├── pages/
│   ├── NotebookHomePage.tsx    # Library UI
│   └── NotebookEditorPage.tsx  # Editor UI
├── layout/NotebookHomeHeader.tsx
├── components/
│   ├── home/                   # Cards, create tile
│   └── editor/                 # Sources, Chat, Studio panels
├── store/
│   ├── libraryStore.ts         # Notebook list + persist
│   └── editorStore.ts          # Active workspace state
├── types/notebook.ts
└── data/
    ├── featured-notebooks.ts
    └── studio-features.ts
```

## Entry from main ANC AI

- Sidebar → **ANC Notebook**
- Settings → **ANC Notebook (Library)**

## Create flow

1. Home → **Create new** → `/notebook/n/{id}`
2. Editor → **Create notebook** → new id + navigate
