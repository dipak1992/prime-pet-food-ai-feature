import { NextResponse } from 'next/server'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function validateScanImage(image: File | null): NextResponse | null {
  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 })
  }

  if (image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image too large' }, { status: 413 })
  }

  return null
}

export async function validateScanImageStrict(image: File | null): Promise<NextResponse | null> {
  const basicError = validateScanImage(image)
  if (basicError || !image) return basicError

  const bytes = new Uint8Array(await image.slice(0, 16).arrayBuffer())
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50

  const matchesType =
    (image.type === 'image/jpeg' && isJpeg) ||
    (image.type === 'image/png' && isPng) ||
    (image.type === 'image/webp' && isWebp)

  if (!matchesType) {
    return NextResponse.json({ error: 'Image content does not match declared type' }, { status: 415 })
  }

  return null
}
