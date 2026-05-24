'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Loader2, ImageIcon } from 'lucide-react'

interface SmartInputProps {
  mode: 'ingredients' | 'inspiration'
  placeholder: string
  onSubmit: (value: string, detectedMode?: 'ingredients' | 'inspiration') => void
  allowPhoto?: boolean
  onPhotoBlocked?: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function SmartInput({ mode, placeholder, onSubmit, allowPhoto = true, onPhotoBlocked }: SmartInputProps) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── File → base64 ──────────────────────────────────────────────────────────

  const readFileAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // strip "data:image/...;base64," prefix
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  // ── Analyze image ──────────────────────────────────────────────────────────

  const analyzeImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('Image must be under 10 MB')
        return
      }

      setError(null)
      setAnalyzing(true)

      // show preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      try {
        const base64 = await readFileAsBase64(file)
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Couldn\'t analyze that image — try another')
        }

        const data = (await res.json()) as {
          type: 'ingredients' | 'inspiration' | 'unknown'
          result: string
        }

        if (data.type === 'unknown' || !data.result) {
          setError("Couldn't detect food in this image. Try typing instead!")
          setPreview(null)
          return
        }

        // Fill textarea with detected result
        setText(data.result)
        setPreview(null)

        // If image reveals a different mode than selected, pass that info up
        if (data.type !== mode) {
          onSubmit(data.result, data.type as 'ingredients' | 'inspiration')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Couldn\'t analyze that image — try typing instead')
        setPreview(null)
      } finally {
        setAnalyzing(false)
      }
    },
    [mode, onSubmit, readFileAsBase64],
  )

  // ── Drop zone ──────────────────────────────────────────────────────────────

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) analyzeImage(file)
    },
    [analyzeImage],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) analyzeImage(file)
      // reset so the same file can be re-selected
      e.target.value = ''
    },
    [analyzeImage],
  )

  // ── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || analyzing) return
    onSubmit(text.trim())
  }

  function clearPreview() {
    setPreview(null)
    setAnalyzing(false)
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* ── Image preview / analyzing state ── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded food"
              className="w-full h-40 object-cover rounded-2xl"
            />
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting food…
                </div>
              </div>
            )}
            {!analyzing && (
              <button
                type="button"
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Textarea + upload button ── */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => {
            setText(e.target.value)
            setError(null)
          }}
          placeholder={placeholder}
          rows={3}
          disabled={analyzing}
          className="w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
          autoFocus
        />
        {/* Camera / upload button */}
        <button
          type="button"
          onClick={() => {
            if (!allowPhoto && onPhotoBlocked) { onPhotoBlocked(); return }
            fileRef.current?.click()
          }}
          disabled={analyzing}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title={allowPhoto ? 'Upload a photo' : 'Pro feature — upgrade to use photo analysis'}
        >
          {analyzing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* ── Drop zone hint (when textarea is empty) ── */}
      {!text && !preview && !analyzing && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            if (!allowPhoto && onPhotoBlocked) { e.preventDefault(); onPhotoBlocked(); return }
            handleDrop(e)
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground/60 text-xs cursor-pointer hover:border-primary/30 hover:text-muted-foreground transition-colors"
          onClick={() => {
            if (!allowPhoto && onPhotoBlocked) { onPhotoBlocked(); return }
            fileRef.current?.click()
          }}
        >
          <ImageIcon className="h-4 w-4" />
          {allowPhoto ? 'Or drop / tap to upload a photo' : '📸 Photo analysis — Pro feature'}
        </div>
      )}

      {/* ── Submit ── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={!text.trim() || analyzing}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
      >
        {analyzing ? 'Analyzing…' : 'Find my meals →'}
      </motion.button>
    </form>
  )
}
