'use client'

import { UploadButton } from '@/lib/uploadthing'
import { Loader2 } from 'lucide-react'

interface VideoUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
}

export function VideoUpload({ value, onChange, label = 'Video', placeholder = 'Upload video' }: VideoUploadProps) {
  return (
    <div>
      {label && (
        <label className="block text-white/80 text-sm font-medium mb-2">{label}</label>
      )}
      <div className="flex flex-col gap-2">
        {value && (
          <div className="relative w-full rounded-lg overflow-hidden bg-background-tertiary border border-background-tertiary">
            <video src={value} controls className="w-full max-h-48" />
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
            endpoint="videoUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) onChange(res[0].url)
            }}
            onUploadError={(error) => {
              console.error('Upload error:', error)
            }}
            content={{
              button({ isUploading }) {
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
          />
        )}
      </div>
    </div>
  )
}
