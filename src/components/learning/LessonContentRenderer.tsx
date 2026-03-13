'use client'

/** Extracts plain text from TipTap/ProseMirror JSON */
function extractTextFromTiptapJson(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { type?: string; text?: string; content?: unknown[] }
  if (n.text) return n.text
  if (Array.isArray(n.content)) {
    return n.content.map(extractTextFromTiptapJson).join('')
  }
  return ''
}

/** Renders lesson content - supports TipTap JSON or plain text */
export function LessonContentRenderer({ content }: { content: string }) {
  if (!content?.trim()) return null

  let displayContent: string
  let isHtml = false

  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && (parsed.type === 'doc' || parsed.content)) {
      displayContent = extractTextFromTiptapJson(parsed)
    } else {
      displayContent = content
    }
  } catch {
    // Plain text or invalid JSON
    displayContent = content
  }

  // If content looks like HTML (e.g. from getHTML), render as HTML
  if (displayContent.trim().startsWith('<')) {
    isHtml = true
  }

  if (isHtml) {
    return (
      <div
        className="prose prose-invert max-w-none text-white/90 [&_a]:text-primary [&_a]:underline [&_img]:rounded-lg [&_img]:max-h-64"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    )
  }

  return (
    <div className="prose prose-invert max-w-none text-white/90 whitespace-pre-wrap">
      {displayContent}
    </div>
  )
}
