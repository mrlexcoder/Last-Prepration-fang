import Editor from '@monaco-editor/react'
import { Icon } from '@/components/icons/Icon'

const defaultCode = `// ANC Code module — connect to your backend API
async function fetchThread(threadId: string) {
  const res = await fetch(\`/api/threads/\${threadId}\`);
  if (!res.ok) throw new Error('Failed to load thread');
  return res.json();
}

// Expected JSON shape (see src/types/thread.ts)
// { id, title, messages: [{ role, content, thinking?, status }] }
`

export function EditorPanel() {
  return (
    <div className="flex h-full flex-col bg-surface-muted/50">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-text-muted">
        <Icon name="code" size={18} className="text-google-blue" />
        <span>Editor</span>
        <span className="ml-auto rounded-md bg-surface px-2 py-0.5">TypeScript</span>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={defaultCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}
