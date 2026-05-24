'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Sparkles, Clock, ChefHat, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Nav } from '@/components/landing/Nav'
import type { FridgeResult } from '@/lib/scan/types'

// ── Component ───────────────────────────────────────────────────────────────

type DemoPhase = 'upload' | 'scanning' | 'results' | 'error'

export function ScanDemoClient() {
  const [phase, setPhase] = useState<DemoPhase>('upload')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<FridgeResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [showStickyCta, setShowStickyCta] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show sticky CTA 2s after results appear
  useEffect(() => {
    if (phase === 'results') {
      const timer = setTimeout(() => setShowStickyCta(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const analyzeImage = useCallback(async (file: File) => {
    setShowStickyCta(false)
    setPhase('scanning')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/scan/demo', {
        method: 'POST',
        body: formData,
      })

      if (res.status === 429) {
        setErrorMsg('You\u2019ve reached the demo limit (3 scans/hour). Sign up free for unlimited scans!')
        setPhase('error')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error || 'Something went wrong. Please try again.')
        setPhase('error')
        return
      }

      const data: FridgeResult = await res.json()
      setResult(data)
      setPhase('results')
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setPhase('error')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    analyzeImage(file)
  }, [analyzeImage])

  const handleCameraCapture = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleReset = useCallback(() => {
    setShowStickyCta(false)
    setPhase('upload')
    setPreviewUrl(null)
    setResult(null)
    setErrorMsg('')
  }, [])

  const handleDemoWithoutPhoto = useCallback(async () => {
    setPreviewUrl('/landing/pantry.jpg')
    setPhase('scanning')

    try {
      // Fetch the sample image and send it to the real API
      const imgRes = await fetch('/landing/pantry.jpg')
      const blob = await imgRes.blob()
      const file = new File([blob], 'sample-pantry.jpg', { type: blob.type || 'image/jpeg' })
      await analyzeImage(file)
    } catch {
      setErrorMsg('Failed to load sample image. Please try uploading your own photo.')
      setPhase('error')
    }
  }, [analyzeImage])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950">
        <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
              <Camera className="h-3 w-3" />
              Free Demo — No Sign-Up Required
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Snap your fridge. Get dinner ideas.
            </h1>
            <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              See how MealEase turns a photo of your ingredients into personalized meal suggestions in seconds.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Phase 1: Upload ── */}
            {phase === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Upload area */}
                <div
                  className="relative rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-white dark:bg-neutral-900 p-8 sm:p-12 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all"
                  onClick={handleCameraCapture}
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                    Take a photo or upload an image
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Snap your fridge, pantry, or any ingredients you have
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
                      onClick={(e) => { e.stopPropagation(); handleCameraCapture() }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-6"
                      onClick={(e) => { e.stopPropagation(); handleCameraCapture() }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Or try without photo */}
                <div className="text-center">
                  <button
                    onClick={handleDemoWithoutPhoto}
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2"
                  >
                    Or try with a sample photo &rarr;
                  </button>
                </div>

                {/* Trust signals */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { icon: ShieldCheck, label: 'Demo photos not saved' },
                    { icon: Clock, label: 'Results in seconds' },
                    { icon: Sparkles, label: 'Real ingredient detection' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="text-center">
                      <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                      <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Phase 2: Scanning animation ── */}
            {phase === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-center space-y-6"
              >
                {previewUrl && (
                  <div className="relative mx-auto w-64 h-64 rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={previewUrl}
                      alt="Your ingredients"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-emerald-600/20 animate-pulse" />
                    {/* Scanning line animation */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 text-emerald-600 animate-spin" />
                    <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                      Analyzing your ingredients...
                    </p>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Our AI is identifying what you have and finding the best meal matches
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Phase 3: Error ── */}
            {phase === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-center space-y-6"
              >
                <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-8">
                  <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto mb-4" />
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Couldn&apos;t complete scan
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                    {errorMsg}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleReset}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-full px-6 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Sign up for unlimited scans
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Phase 4: Results ── */}
            {phase === 'results' && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Detected ingredients — fully visible */}
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-neutral-900 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      {result.ingredients.length} ingredient{result.ingredients.length !== 1 ? 's' : ''} detected
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map((ing) => (
                      <span
                        key={ing.id}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 border border-emerald-200 dark:border-emerald-800/50"
                      >
                        {ing.emoji && <span>{ing.emoji}</span>}
                        <CheckCircle2 className="h-3 w-3" />
                        {ing.name}
                        {ing.quantity && (
                          <span className="text-emerald-500 text-[10px]">
                            {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meal suggestions — titles visible, details gated */}
                {result.recipes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-[#D97757]" />
                      <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                        Meals you can make tonight
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {result.recipes.map((recipe, i) => {
                        const matchPercent = recipe.matchedIngredients.length > 0
                          ? Math.round((recipe.matchedIngredients.length / (recipe.matchedIngredients.length + recipe.missingIngredients.length)) * 100)
                          : null

                        return (
                          <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, duration: 0.25 }}
                            className="relative rounded-2xl border border-border/60 bg-white dark:bg-neutral-900 overflow-hidden"
                          >
                            {/* Visible: title, match %, cook time */}
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h3 className="font-bold text-neutral-900 dark:text-white">{recipe.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2.5 py-0.5">
                                      <Clock className="h-3 w-3" />
                                      {recipe.cookTime} min
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2.5 py-0.5">
                                      <Users className="h-3 w-3" />
                                      {recipe.servings} servings
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2.5 py-0.5">
                                      <ChefHat className="h-3 w-3" />
                                      ~${recipe.estimatedCost.toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                                {matchPercent !== null && (
                                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 border border-emerald-200 dark:border-emerald-800/50">
                                    {matchPercent}% match
                                  </span>
                                )}
                              </div>

                              {/* Matched ingredients preview */}
                              {recipe.matchedIngredients.length > 0 && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                                  Uses: {recipe.matchedIngredients.slice(0, 3).join(', ')}
                                  {recipe.matchedIngredients.length > 3 && ` +${recipe.matchedIngredients.length - 3} more`}
                                </p>
                              )}
                            </div>

                            {/* Gated: locked overlay for full recipe */}
                            <div className="border-t border-border/40 bg-neutral-50/80 dark:bg-neutral-800/50 px-5 py-3">
                              <Link
                                href={`/signup?intent=scan-recipe&recipe=${recipe.id}`}
                                className="flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3.5 w-3.5 text-[#D97757]" />
                                  <span className="text-sm font-semibold text-[#D97757] group-hover:text-[#C86646] transition-colors">
                                    Sign up free to see full recipe
                                  </span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-[#D97757] group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 ml-5.5">
                                Step-by-step instructions, grocery list &amp; cooking tips
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Inline CTA section */}
                <div className="rounded-2xl bg-gradient-to-br from-[#D97757]/10 to-orange-50 dark:from-[#D97757]/20 dark:to-neutral-900 border border-[#D97757]/20 p-6 text-center">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Like what you see? Get the full experience.
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5 max-w-sm mx-auto">
                    Sign up free to unlock full recipes with step-by-step cooking, save ingredients to your pantry, get grocery lists, and personalized meal plans for your whole family.
                  </p>
                  <p className="mx-auto mb-5 max-w-sm text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                    Privacy note: this demo uses your photo only to detect visible ingredients.
                    The demo result is not saved to your pantry.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] text-white font-semibold rounded-full px-6 py-3 transition-all shadow-md shadow-orange-200/50 dark:shadow-none"
                    >
                      Start free — no credit card
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-full px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try another photo
                    </button>
                  </div>
                </div>

                {/* Product proof */}
                <div className="text-center pt-4 pb-16">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    500+ curated recipes &bull; Free forever plan &bull; No credit card required
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Sticky bottom CTA bar (appears after results) ── */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="mx-auto max-w-2xl flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  Ready to cook? Get full recipes free.
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                  3 free scans/week + step-by-step recipes + grocery lists
                </p>
              </div>
              <Link
                href="/signup"
                className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D97757] to-[#E8895A] hover:from-[#C86646] hover:to-[#D97757] text-white font-semibold rounded-full px-5 py-2.5 text-sm transition-all shadow-md shadow-orange-200/50 dark:shadow-none"
              >
                Sign up free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
