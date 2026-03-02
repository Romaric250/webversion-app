'use client'

import { useCallback, useMemo } from 'react'
import {
  EditorRoot,
  EditorContent,
  createImageUpload,
  createSuggestionItems,
  handleImagePaste,
  handleImageDrop,
  UploadImagesPlugin,
  UpdatedImage,
  Placeholder,
  StarterKit,
  Command,
  TiptapLink,
  TiptapUnderline,
  HighlightExtension,
  HorizontalRule,
  ImageResizer,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorCommandList,
  renderItems,
} from 'novel'
import type { EditorView } from '@tiptap/pm/view'
import { useUploadThing } from '@/lib/uploadthing'
import { ImageIcon, Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote, Minus, Heading1, Heading2, Heading3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const tiptapImage = UpdatedImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cn('opacity-40 rounded-lg border border-stone-200'),
      }),
    ]
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cn('rounded-lg border border-muted'),
  },
})

const getSuggestionItems = () => createSuggestionItems([
  {
    title: 'Heading 1',
    description: 'Big section heading',
    searchTerms: ['title', 'big', 'large'],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    searchTerms: ['subtitle', 'medium'],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    searchTerms: ['subtitle', 'small'],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
    },
  },
  {
    title: 'Bold',
    description: 'Bold text',
    searchTerms: ['strong'],
    icon: <Bold size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run()
    },
  },
  {
    title: 'Italic',
    description: 'Italic text',
    searchTerms: ['emphasis'],
    icon: <Italic size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run()
    },
  },
  {
    title: 'Strikethrough',
    description: 'Strikethrough text',
    searchTerms: ['strike'],
    icon: <Strikethrough size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleStrike().run()
    },
  },
  {
    title: 'Code',
    description: 'Code block',
    searchTerms: ['codeblock'],
    icon: <Code size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: 'Bullet List',
    description: 'Bullet list',
    searchTerms: ['unordered', 'ul'],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Numbered List',
    description: 'Numbered list',
    searchTerms: ['ordered', 'ol'],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Quote',
    description: 'Block quote',
    searchTerms: ['blockquote'],
    icon: <Quote size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'Divider',
    description: 'Horizontal rule',
    searchTerms: ['hr', 'horizontal'],
    icon: <Minus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Image',
    description: 'Upload an image from your computer',
    searchTerms: ['photo', 'picture', 'media'],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const fn = (window as unknown as { __uploadFn?: (f: File, v: EditorView, p: number) => void }).__uploadFn
        if (input.files?.length && fn) {
          const file = input.files[0]
          const pos = editor.view.state.selection.from
          fn(file, editor.view, pos)
        }
      }
      input.click()
    },
  },
])

interface LessonContentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LessonContentEditor({ value, onChange, placeholder = "Press '/' for commands" }: LessonContentEditorProps) {
  const { startUpload } = useUploadThing('imageUploader')

  const onUpload = useCallback(
    async (file: File) => {
      const res = await startUpload([file])
      const url = res?.[0]?.url
      if (!url) throw new Error('Upload failed')
      return url
    },
    [startUpload]
  )

  const uploadFn = useMemo(
    () =>
      createImageUpload({
        onUpload,
        validateFn: (file) => {
          if (!file.type.includes('image/')) return false
          if (file.size / 1024 / 1024 > 4) return false
          return true
        },
      }),
    [onUpload]
  )

  if (typeof window !== 'undefined') {
    (window as unknown as { __uploadFn?: (f: File, v: EditorView, p: number) => void }).__uploadFn = uploadFn
  }

  const suggestionItems = useMemo(() => getSuggestionItems(), [])
  const slashExtension = useMemo(
    () =>
      Command.configure({
        suggestion: {
          char: '/',
          startOf: () => true,
          command: ({ editor, range, props }) => props.command({ editor, range }),
          items: ({ query }) =>
            suggestionItems.filter(
              (item) =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.searchTerms?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
            ),
          render: () => renderItems(),
        },
      }),
    [suggestionItems]
  )

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        placeholder: {
          placeholder,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      slashExtension,
      tiptapImage,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      TiptapUnderline,
      HighlightExtension.configure({ multicolor: true }),
      HorizontalRule,
    ],
    [placeholder, slashExtension]
  )

  const initialContent = useMemo(() => {
    if (!value?.trim()) return undefined
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }] }
    }
    return undefined
  }, [])

  return (
    <EditorRoot>
      <EditorContent
        className="min-h-[200px] w-full rounded-lg border border-background-tertiary bg-background-tertiary/50 px-4 py-3 text-white placeholder:text-white/40 outline-none focus-within:border-primary/50 prose prose-invert prose-sm max-w-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none"
        extensions={extensions}
        initialContent={initialContent}
        onUpdate={({ editor }) => {
          const html = editor.getHTML()
          const json = editor.getJSON()
          onChange(JSON.stringify(json))
        }}
        editorProps={{
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
    }}
      >
        <EditorCommand className="z-50 w-72 overflow-hidden rounded-xl border border-background-tertiary bg-background-elevated shadow-xl">
          <EditorCommandEmpty className="px-6 py-4 text-center text-sm text-white/60">
            No results
          </EditorCommandEmpty>
          <EditorCommandList className="max-h-[300px] overflow-y-auto">
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={(props) => item.command?.(props)}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white hover:bg-primary/20"
              >
                <span className="text-white/60">{item.icon}</span>
                <span>{item.title}</span>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <ImageResizer />
      </EditorContent>
    </EditorRoot>
  )
}
