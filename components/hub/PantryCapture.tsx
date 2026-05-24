'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Pencil, X, Loader2, Plus, ArrowRight, RefreshCw } from 'lucide-react'
import { PaywallDialog } from '@/components/paywall/PaywallDialog'
import { usePaywallStatus } from '@/lib/paywall/use-paywall-status'

interface Props {
  onConfirm: (items: string[]) => void
  onCancel: () => void
}

type Phase = 'choose' | 'scanning' | 'manual' | 'review'

// ── Source-tagged ingredient for combined fridge+pantry flow ──
interface TaggedIngredient {
  name: string
  source: 'fridge' | 'pantry' | 'manual'
}

// ── Image compression helper ──────────────────────────────────

async function compressImageForVision(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = rawDataUrl
  })

  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return rawDataUrl

  ctx.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

// ── Ingredient normalization ──────────────────────────────────
// Deduplicates ingredients across fridge + pantry sources.
// "tomato sauce" and "canned tomatoes" are kept separate (different items).
// Exact duplicates (same name) are merged, keeping the first source.

function normalizeAndDedup(tagged: TaggedIngredient[]): TaggedIngredient[] {
  const seen = new Map<string, TaggedIngredient>()
  for (const item of tagged) {
    const key = item.name.toLowerCase().trim()
    if (!key) continue
    if (!seen.has(key)) {
      seen.set(key, { ...item, name: key })
    }
    // If already seen, keep the first occurrence (preserves source)
  }
  return Array.from(seen.values())
}

// ── Validate ingredient list before confirming ────────────────

function validateIngredients(items: TaggedIngredient[]): string | null {
  const valid = items.filter(i => i.name.trim().length > 0)
  if (valid.length === 0) return 'No ingredients found. Please add at least one item.'
  if (valid.length > 80) return 'Too many ingredients. Please remove some before continuing.'
  return null
}

// ── Main Component ────────────────────────────────────────────

export function PantryCapture({ onConfirm, onCancel }: Props) {
  const [phase, setPhase] = useState<Phase>('choose')
  // Tagged ingredients track source (fridge / pantry / manual)
  const [taggedItems, setTaggedItems] = useState<TaggedIngredient[]>([])
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)
  // Track which scan source is active so we can label items correctly
  const [pendingScanSource, setPendingScanSource] = useState<'fridge' | 'pantry'>('fridge')
  const [scanningSource, setScanningSource] = useState<'fridge' | 'pantry' | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const { status, loading: paywallStatusLoading } = usePaywallStatus()

  // ── Camera / file pick ────────────────────────────────────

  const triggerScan = useCallback((source: 'fridge' | 'pantry') => {
    setPendingScanSource(source)
    fileRef.current?.click()
  }, [])

  const handleCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const source = pendingScanSource
    setScanningSource(source)
    setPhase('scanning')
    setError(null)

    try {
      const dataUrl = await compressImageForVision(file)

      const res = await fetch('/api/pantry/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        if (res.status === 402) {
          setPaywallOpen(true)
          setError(body?.error ?? 'Free Snap & Cook quota reached. Upgrade for unlimited scans.')
          setPhase('choose')
          setScanningSource(null)
          return
        }
        throw new Error(body?.error ?? 'Scan failed')
      }

      const data = await res.json()
      // Validate response shape
      const rawDetected: unknown = data?.data?.items
      const detected: string[] = Array.isArray(rawDetected)
        ? rawDetected.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
        : []

      if (detected.length === 0) {
        setError('No ingredients detected — try a clearer photo or add manually.')
        setPhase(taggedItems.length > 0 ? 'review' : 'choose')
        setScanningSource(null)
        return
      }

      // Merge new detections with existing items, tagging with source
      setTaggedItems(prev => {
        const newItems: TaggedIngredient[] = detected.map(name => ({
          name: name.toLowerCase().trim(),
          source,
        }))
        return normalizeAndDedup([...prev, ...newItems])
      })
      setPhase('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Please try again.')
      setPhase(taggedItems.length > 0 ? 'review' : 'choose')
    } finally {
      setScanningSource(null)
      // Reset file input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [pendingScanSource, taggedItems.length])

  // ── Manual add ────────────────────────────────────────────

  const addManualItem = useCallback(() => {
    const val = manualInput.trim().toLowerCase()
    if (!val) return
    setTaggedItems(prev => {
      const exists = prev.some(i => i.name === val)
      if (exists) return prev
      return [...prev, { name: val, source: 'manual' }]
    })
    setManualInput('')
  }, [manualInput])

  const removeItem = useCallback((name: string) => {
    setTaggedItems(prev => prev.filter(i => i.name !== name))
  }, [])

  const handleManualKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addManualItem()
    }
  }, [addManualItem])

  // ── Confirm ───────────────────────────────────────────────

  const handleConfirm = useCallback(() => {
    const validationError = validateIngredients(taggedItems)
    if (validationError) {
      setError(validationError)
      return
    }
    // Pass only the names (strings) to the parent — normalized and deduped
    const names = taggedItems.map(i => i.name).filter(Boolean)
    onConfirm(names)
  }, [taggedItems, onConfirm])

  // ── Source badge color ────────────────────────────────────

  const sourceBadge = (source: TaggedIngredient['source']) => {
    if (source === 'fridge') return 'bg-blue-50 border-blue-200 text-blue-900'
    if (source === 'pantry') return 'bg-amber-50 border-amber-200 text-amber-900'
    return 'bg-emerald-50 border-emerald-200 text-emerald-900'
  }

  const sourceLabel = (source: TaggedIngredient['source']) => {
    if (source === 'fridge') return '🧊'
    if (source === 'pantry') return '🥫'
    return '✏️'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      <AnimatePresence mode="wait">
        {/* ── CHOOSE MODE ──────────────────────────────────── */}
        {phase === 'choose' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground leading-snug">
                🥫 What&apos;s in your kitchen?
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Snap a photo of your fridge, pantry, or type items manually
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Fridge scan */}
              <button
                onClick={() => triggerScan('fridge')}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 border-blue-300/60 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-400/60 hover:shadow-lg transition-all group text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold group-hover:text-blue-700 transition-colors">
                    📸 Snap your fridge
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    AI detects what&apos;s inside
                  </p>
                </div>
              </button>

              {/* Pantry scan */}
              <button
                onClick={() => triggerScan('pantry')}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 border-amber-300/60 bg-amber-50/60 hover:bg-amber-50 hover:border-amber-400/60 hover:shadow-lg transition-all group text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
                  <Camera className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold group-hover:text-amber-700 transition-colors">
                    🥫 Snap your pantry shelf
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Detect dry goods, cans, and staples
                  </p>
                </div>
              </button>

              {/* Manual entry */}
              <button
                onClick={() => setPhase('manual')}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-border/60 bg-white hover:border-primary/40 hover:shadow-md transition-all group text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 flex-shrink-0">
                  <Pencil className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">
                    ✏️ Type ingredients
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add items one by one
                  </p>
                </div>
              </button>
            </div>

            {/* Continue with existing items */}
            {taggedItems.length > 0 && (
              <button
                onClick={() => setPhase('review')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Review {taggedItems.length} item{taggedItems.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onCancel}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* ── SCANNING ─────────────────────────────────────── */}
        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-semibold text-foreground">
              Scanning your {scanningSource === 'pantry' ? 'pantry' : 'fridge'}…
            </p>
            <p className="text-xs text-muted-foreground mt-1">AI is identifying ingredients</p>
          </motion.div>
        )}

        {/* ── MANUAL INPUT ─────────────────────────────────── */}
        {phase === 'manual' && (
          <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground leading-snug">
                ✏️ Add your ingredients
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Type an item and press Enter or tap +
              </p>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={handleManualKeyDown}
                placeholder="e.g. chicken breast"
                className="flex-1 rounded-xl border border-border/60 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
              <button
                onClick={addManualItem}
                disabled={!manualInput.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Item chips */}
            {taggedItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {taggedItems.map(item => (
                  <span
                    key={item.name}
                    className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-full border text-sm ${sourceBadge(item.source)}`}
                  >
                    <span className="text-xs">{sourceLabel(item.source)}</span>
                    {item.name}
                    <button
                      onClick={() => removeItem(item.name)}
                      className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => triggerScan('fridge')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <Camera className="h-4 w-4" />
                Scan fridge too
              </button>
              {taggedItems.length > 0 && (
                <button
                  onClick={() => setPhase('review')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Review ({taggedItems.length})
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setPhase('choose')}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Back
            </button>
          </motion.div>
        )}

        {/* ── REVIEW ───────────────────────────────────────── */}
        {phase === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground leading-snug">
                ✅ Confirm your items
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove anything that doesn&apos;t look right
              </p>

              {/* Source legend */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400" /> Fridge
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" /> Pantry
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" /> Manual
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {error}
              </div>
            )}

            {taggedItems.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-6 text-center mb-4">
                <p className="text-sm text-muted-foreground">No ingredients yet.</p>
                <button
                  onClick={() => setPhase('choose')}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Add some →
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-5">
                {taggedItems.map(item => (
                  <motion.span
                    key={item.name}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-full border text-sm ${sourceBadge(item.source)}`}
                  >
                    <span className="text-xs">{sourceLabel(item.source)}</span>
                    {item.name}
                    <button
                      onClick={() => removeItem(item.name)}
                      className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={taggedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Use these {taggedItems.length} item{taggedItems.length !== 1 ? 's' : ''}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => triggerScan('fridge')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-700 hover:bg-blue-100 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  + Fridge
                </button>
                <button
                  onClick={() => triggerScan('pantry')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-700 hover:bg-amber-100 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  + Pantry
                </button>
                <button
                  onClick={() => setPhase('manual')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                >
                  <Pencil className="h-4 w-4" />
                  + Type
                </button>
              </div>
            </div>

            <button
              onClick={() => setPhase('choose')}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>

      <PaywallDialog
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="scan"
        title="Unlock Unlimited Snap & Cook"
        description="Free accounts get 3 Snap & Cook scans per week. Upgrade to Plus for unlimited scans and faster meal decisions."
        isAuthenticated={paywallStatusLoading || status.isAuthenticated}
        redirectPath="/dashboard"
      />
    </>
  )
}
