'use client'

import { useCallback, useMemo } from 'react'
import {
  EditorRoot,
  EditorContent,
  createImageUpload,
  handleImagePaste,
  handleImageDrop,
  UploadImagesPlugin,
  UpdatedImage,
  Placeholder,
  StarterKit,
  TiptapLink,
  TiptapUnderline,
  HighlightExtension,
  HorizontalRule,
  ImageResizer,
  EditorBubble,
  EditorBubbleItem,
} from 'novel'
import { useUploadThing } from '@/lib/uploadthing'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, ImageIcon } from 'lucide-react'
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

interface LessonContentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LessonContentEditor({ value, onChange, placeholder = "Select text for formatting options" }: LessonContentEditorProps) {
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

  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      tiptapImage,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      TiptapUnderline,
      HighlightExtension.configure({ multicolor: true }),
      HorizontalRule,
    ],
    [placeholder]
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
        <EditorBubble className="flex items-center gap-0.5 rounded-lg border border-background-tertiary bg-background-elevated p-1 shadow-lg">
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().toggleBold().run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <Bold className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().toggleItalic().run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <Italic className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().toggleBulletList().run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <List className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().toggleOrderedList().run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <ListOrdered className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().setHeading({ level: 1 }).run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <Heading1 className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem onSelect={(editor) => editor.chain().focus().setHeading({ level: 2 }).run()}>
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <Heading2 className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = async () => {
                if (input.files?.length) {
                  const file = input.files[0]
                  const pos = editor.view.state.selection.from
                  uploadFn(file, editor.view, pos)
                }
              }
              input.click()
            }}
          >
            <button type="button" className="p-2 rounded hover:bg-background-tertiary text-white/80 hover:text-white">
              <ImageIcon className="h-4 w-4" />
            </button>
          </EditorBubbleItem>
        </EditorBubble>
        <ImageResizer />
      </EditorContent>
    </EditorRoot>
  )
}
