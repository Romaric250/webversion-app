'use client'

import { UploadButton } from '@/lib/uploadthing'
import { Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function ImageUpload({ value, onChange, label = 'Image', placeholder = 'Upload image' }: ImageUploadProps) {
  return (
    <div>
      {label && (
        <label className="block text-white/80 text-sm font-medium mb-2">{label}</label>
      )}
      <div className="flex flex-col gap-2">
        {value && (
          <div className="relative w-full h-32 rounded-lg overflow-hidden bg-background-tertiary border border-background-tertiary">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 px-2 py-1 rounded bg-red-500/80 text-white text-xs hover:bg-red-500"
            >
              Remove
            </button>
          </div>
        )}
        {!value && (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) onChange(res[0].url)
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
            }}
            content={{
              button({ ready, isUploading }) {
                return (
                  <span className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background-tertiary border border-background-tertiary text-white/80 hover:bg-background-elevated hover:text-white text-sm">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      placeholder
                    )}
                  </span>
                )
              },
            }}
            appearance={{
              button: 'ut-ready:bg-primary ut-uploading:bg-primary/50 ut-uploading:cursor-not-allowed',
            }}
          />
        )}
      </div>
    </div>
  )
}
