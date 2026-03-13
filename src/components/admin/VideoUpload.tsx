'use client'

import { useRef } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Video, Loader2, X } from 'lucide-react'

interface VideoUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export function VideoUpload({ value, onChange, label = 'Video' }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { startUpload, isUploading } = useUploadThing('videoUploader', {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) onChange(res[0].url)
    },
    onUploadError: () => onChange(''),
  })

  const handleClick = () => {
    if (value) return
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await startUpload([file])
    e.target.value = ''
  }

  return (
    <div>
      {label && (
        <label className="block text-white/80 text-sm font-medium mb-2">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {value ? (
        <div className="relative group">
          <div className="w-full rounded-xl overflow-hidden bg-background-tertiary border border-background-tertiary aspect-video">
            <video src={value} controls className="w-full h-full object-contain" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors shadow-lg"
            aria-label="Remove video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full h-32 rounded-xl border-2 border-dashed border-background-tertiary bg-background-tertiary/30 hover:border-primary/40 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-white/70 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <Video className="h-10 w-10 text-white/50" />
              <span className="text-sm font-medium">Click to upload video</span>
              <span className="text-xs text-white/40">MP4, WebM up to 500MB</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
