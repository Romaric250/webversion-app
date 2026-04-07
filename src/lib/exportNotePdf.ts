import { jsPDF } from 'jspdf'

const PRIMARY = { r: 56, g: 224, b: 120 }
const MUTED = { r: 100, g: 110, b: 105 }
const BODY = { r: 28, g: 32, b: 30 }

/** Split body the same way as the PDF renderer (paragraphs). */
export function splitNoteBodyIntoParagraphs(body: string): string[] {
  const text = (body || '').trim()
  if (!text) return []
  const blocks = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return blocks.length ? blocks : [text]
}

/**
 * Build the PDF document (shared by download + preview).
 */
export function buildNotePdfDocument(
  title: string,
  body: string,
  options?: { exportedAt?: Date }
): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxW = pageW - margin * 2
  let y = margin

  const exportedAt = options?.exportedAt ?? new Date()
  const exportedStr = exportedAt.toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  doc.setFillColor(15, 25, 20)
  doc.rect(0, 0, pageW, 22, 'F')
  doc.setTextColor(PRIMARY.r, PRIMARY.g, PRIMARY.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('SignNova', margin, 12)
  doc.setTextColor(180, 190, 185)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Notes · Breaking barriers in communication', margin, 19)

  y = 32

  doc.setTextColor(20, 24, 22)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  const safeTitle = (title || 'Untitled note').trim() || 'Untitled note'
  const titleLines = doc.splitTextToSize(safeTitle, maxW)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 6.5 + 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
  doc.text(`Exported ${exportedStr}`, margin, y)
  y += 8

  doc.setDrawColor(PRIMARY.r, PRIMARY.g, PRIMARY.b)
  doc.setLineWidth(0.35)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  const text = (body || '').trim()
  if (!text) {
    doc.setFontSize(10)
    doc.setTextColor(140, 140, 140)
    doc.text('(No content)', margin, y)
    return doc
  }

  const paragraphs = splitNoteBodyIntoParagraphs(body)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(BODY.r, BODY.g, BODY.b)
  const lineHeight = 5.2
  const paraGap = 5

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, maxW)
    const blockH = lines.length * lineHeight + paraGap
    if (y + blockH > pageH - margin) {
      doc.addPage()
      y = margin
    }
    doc.text(lines, margin, y)
    y += lines.length * lineHeight + paraGap
  }

  return doc
}

export function filenameFromNoteTitle(title: string) {
  const base = (title || 'note')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return base || 'signnova-note'
}

/**
 * Download PDF to the user's device.
 */
export function exportNoteToPdf(
  title: string,
  body: string,
  options?: { exportedAt?: Date }
) {
  const doc = buildNotePdfDocument(title, body, options)
  const safeTitle = (title || 'Untitled note').trim() || 'Untitled note'
  doc.save(`${filenameFromNoteTitle(safeTitle)}.pdf`)
}

/**
 * Create a temporary blob URL for in-browser PDF preview. Caller must revoke with URL.revokeObjectURL when done.
 */
export function createNotePdfPreviewUrl(
  title: string,
  body: string,
  options?: { exportedAt?: Date }
): string {
  const doc = buildNotePdfDocument(title, body, options)
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)
}
