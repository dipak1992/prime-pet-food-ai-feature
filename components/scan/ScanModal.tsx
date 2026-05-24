'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useScanStore } from '@/stores/scanStore'
import { ScanCamera } from './ScanCamera'
import { ScanProcessing } from './ScanProcessing'
import { ModePicker } from './ModePicker'
import { FridgeResults } from './FridgeResults'
import { MenuResults } from './MenuResults'
import { FoodResults } from './FoodResults'
import { ScanError } from './ScanError'
import { trackScan } from '@/lib/scan/analytics'
import { hapticTap } from '@/lib/scan/haptics'
import type { ScanErrorKind } from '@/lib/scan/types'

export function ScanModal() {
  const isOpen = useScanStore((s) => s.isOpen)
  const step = useScanStore((s) => s.step)
  const mode = useScanStore((s) => s.mode)
  const imageDataUrl = useScanStore((s) => s.imageDataUrl)
  const classifyResult = useScanStore((s) => s.classifyResult)
  const resolvedType = useScanStore((s) => s.resolvedType)
  const fridgeResult = useScanStore((s) => s.fridgeResult)
  const menuResult = useScanStore((s) => s.menuResult)
  const foodResult = useScanStore((s) => s.foodResult)
  const errorKind = useScanStore((s) => s.errorKind)
  const errorMessage = useScanStore((s) => s.errorMessage)
  const openedAt = useScanStore((s) => s.openedAt)
  const isDemo = useScanStore((s) => s.isDemo)

  // Get actions via getState() to avoid subscribing to the entire store (React #185)
  const { close, setMode, capture, retake, confirmType, setError } = useScanStore.getState()

  const overlayRef = useRef<HTMLDivElement>(null)

  // Track open
  useEffect(() => {
    if (isOpen) {
      trackScan('scan_opened', { mode })
    }
  }, [isOpen, mode])

  // Track close with duration
  const handleClose = () => {
    hapticTap()
    const duration = openedAt ? Date.now() - openedAt : undefined
    trackScan('scan_closed', { step, duration_ms: duration })
    close()
  }

  // Trap focus & close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'processing') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isLocked = step === 'processing' || step === 'classifying'

  const handleCameraError = (errKind: string) => {
    setError(errKind as ScanErrorKind)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={isLocked ? undefined : handleClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Scan food, fridge, or menu"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white dark:bg-neutral-950 rounded-t-3xl overflow-hidden"
            style={{
              maxHeight: '95dvh',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Close button (hidden during processing) */}
            {!isLocked && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Close scan modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Live region for screen readers */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {step === 'classifying' && 'Classifying your image…'}
              {step === 'processing' && 'Processing your scan…'}
              {step === 'results' && 'Scan results are ready'}
              {step === 'error' && `Error: ${errorMessage ?? errorKind}`}
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                {/* Camera */}
                {(step === 'camera') && (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <ScanCamera
                      mode={mode}
                      onCapture={(blob, dataUrl) => {
                        trackScan('scan_captured', { mode })
                        capture(blob, dataUrl)
                      }}
                      onModeChange={(m) => setMode(m)}
                      onError={handleCameraError}
                    />
                  </motion.div>
                )}

                {/* Classifying / Captured */}
                {(step === 'captured' || step === 'classifying') && (
                  <motion.div
                    key="classifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <ScanProcessing label="Analyzing your image…" />
                  </motion.div>
                )}

                {/* Mode picker */}
                {step === 'picking' && (
                  <motion.div
                    key="picking"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full overflow-y-auto"
                  >
                    <ModePicker
                      imageDataUrl={imageDataUrl}
                      classifyResult={classifyResult}
                      onPick={(type) => {
                        trackScan('scan_mode_picked', { type })
                        confirmType(type)
                      }}
                    />
                  </motion.div>
                )}

                {/* Processing */}
                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <ScanProcessing />
                  </motion.div>
                )}

                {/* Results */}
                {step === 'results' && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-y-auto"
                  >
                    {resolvedType === 'fridge' && fridgeResult && (
                      <FridgeResults
                        result={fridgeResult}
                        isDemo={isDemo}
                        onClose={handleClose}
                        onRetake={() => { trackScan('scan_retake'); retake() }}
                      />
                    )}
                    {resolvedType === 'menu' && menuResult && (
                      <MenuResults
                        result={menuResult}
                        onClose={handleClose}
                        onRetake={() => { trackScan('scan_retake'); retake() }}
                      />
                    )}
                    {resolvedType === 'food' && foodResult && (
                      <FoodResults
                        result={foodResult}
                        onClose={handleClose}
                        onRetake={() => { trackScan('scan_retake'); retake() }}
                      />
                    )}
                  </motion.div>
                )}

                {/* Error */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <ScanError
                      kind={errorKind}
                      message={errorMessage}
                      onRetake={() => { trackScan('scan_retake'); retake() }}
                      onClose={handleClose}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
