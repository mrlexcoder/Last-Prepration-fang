import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css' // Nice dark code theme

interface AnswerRendererProps {
  content: string
}

export function AnswerRenderer({ content }: AnswerRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert text-text leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Better code block styling
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !props.inline && match ? (
              <div className="relative my-3 rounded-xl bg-[#0d1117] border border-border-soft overflow-hidden">
                <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] text-xs text-text-muted border-b border-border-soft">
                  <span>{match[1]}</span>
                </div>
                <pre className="!mt-0 !mb-0 !p-4 text-sm overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="rounded bg-sidebar px-1.5 py-0.5 text-sm font-mono text-google-blue" {...props}>
                {children}
              </code>
            )
          },
          // Nice headings
          h1: ({ children }) => <h1 className="text-xl font-semibold mt-5 mb-2 text-text">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-text">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1.5 text-text">{children}</h3>,
          // Better lists
          ul: ({ children }) => <ul className="my-2 space-y-1 pl-5 list-disc marker:text-google-blue">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 pl-5 list-decimal marker:text-google-blue">{children}</ol>,
          // Strong warnings
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-amber-500 bg-amber-500/10 pl-4 py-2 text-amber-700 dark:text-amber-400 text-sm">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
