import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      return { uploadedAt: new Date().toISOString() }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),

  videoUploader: f({
    video: { maxFileSize: '32MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      return { uploadedAt: new Date().toISOString() }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
