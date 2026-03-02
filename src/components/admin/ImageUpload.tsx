'use client'

import { useRef } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { ImagePlus, Loader2, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { startUpload, isUploading } = useUploadThing('imageUploader', {
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
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {value ? (
        <div className="relative group">
          <div className="w-full h-40 rounded-xl overflow-hidden bg-background-tertiary border border-background-tertiary">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-background-tertiary bg-background-tertiary/30 hover:border-primary/40 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-white/70 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-white/50" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-white/40">PNG, JPG up to 4MB</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
