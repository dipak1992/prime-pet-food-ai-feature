export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0–1
  mimeType?: string
}

/**
 * Compress an image Blob using OffscreenCanvas (worker-safe) with a
 * DOM canvas fallback for browsers that don't support OffscreenCanvas.
 */
export async function compressImage(
  blob: Blob,
  opts: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = opts

  const bitmap = await createImageBitmap(blob)
  const { width: origW, height: origH } = bitmap

  // Calculate scaled dimensions preserving aspect ratio
  const scale = Math.min(maxWidth / origW, maxHeight / origH, 1)
  const w = Math.round(origW * scale)
  const h = Math.round(origH * scale)

  // Try OffscreenCanvas first (works in workers + modern browsers)
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    return canvas.convertToBlob({ type: mimeType, quality })
  }

  // DOM canvas fallback
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('canvas.toBlob returned null'))
      },
      mimeType,
      quality
    )
  })
}
