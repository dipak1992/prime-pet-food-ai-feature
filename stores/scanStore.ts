'use client'

import { create } from 'zustand'
import type {
  ScanStep,
  ScanMode,
  ScanType,
  ScanErrorKind,
  FridgeResult,
  MenuResult,
  FoodResult,
  ClassifyResponse,
} from '@/lib/scan/types'

// ─── State Shape ──────────────────────────────────────────────────────────
interface ScanState {
  // Modal visibility
  isOpen: boolean

  // State machine step
  step: ScanStep

  // Selected mode (auto = let AI decide)
  mode: ScanMode

  // Captured image blob (from camera or file input)
  imageBlob: Blob | null
  imageDataUrl: string | null

  // Classification result
  classifyResult: ClassifyResponse | null

  // Resolved scan type (after picking or auto-classify)
  resolvedType: ScanType | null

  // Results (only one will be populated per scan)
  fridgeResult: FridgeResult | null
  menuResult: MenuResult | null
  foodResult: FoodResult | null

  // Error state
  errorKind: ScanErrorKind | null
  errorMessage: string | null

  // Timing (for analytics)
  openedAt: number | null
  isDemo: boolean
}

// ─── Actions Shape ────────────────────────────────────────────────────────
interface ScanActions {
  open: (initialMode?: ScanMode) => void
  openDemo: () => void
  close: () => void
  setMode: (mode: ScanMode) => void
  startCamera: () => void
  capture: (blob: Blob, dataUrl: string) => void
  retake: () => void
  confirmType: (type: ScanType) => void
  setError: (kind: ScanErrorKind, message?: string) => void
  reset: () => void
  // Internal — called after capture to run classify
  _classify: () => Promise<void>
  // Internal — called after type is confirmed to run processing
  _process: (type: ScanType) => Promise<void>
  // Result setters
  _setFridgeResult: (result: FridgeResult) => void
  _setMenuResult: (result: MenuResult) => void
  _setFoodResult: (result: FoodResult) => void
}

// ─── Initial State ────────────────────────────────────────────────────────
const INITIAL_STATE: ScanState = {
  isOpen: false,
  step: 'idle',
  mode: 'auto',
  imageBlob: null,
  imageDataUrl: null,
  classifyResult: null,
  resolvedType: null,
  fridgeResult: null,
  menuResult: null,
  foodResult: null,
  errorKind: null,
  errorMessage: null,
  openedAt: null,
  isDemo: false,
}

// ─── Store ────────────────────────────────────────────────────────────────
export const useScanStore = create<ScanState & ScanActions>((set, get) => ({
  ...INITIAL_STATE,

  open: (initialMode = 'auto') => {
    set({
      ...INITIAL_STATE,
      isOpen: true,
      step: 'camera',
      mode: initialMode,
      openedAt: Date.now(),
      isDemo: false,
    })
  },

  openDemo: () => {
    set({
      ...INITIAL_STATE,
      isOpen: true,
      step: 'camera',
      mode: 'fridge',
      openedAt: Date.now(),
      isDemo: true,
    })
  },

  close: () => {
    set({ isOpen: false, step: 'idle' })
  },

  setMode: (mode) => {
    set({ mode })
  },

  startCamera: () => {
    set({ step: 'camera' })
  },

  capture: (blob, dataUrl) => {
    set({
      imageBlob: blob,
      imageDataUrl: dataUrl,
      step: 'captured',
    })
    // Kick off classification immediately
    get()._classify()
  },

  retake: () => {
    set({
      imageBlob: null,
      imageDataUrl: null,
      classifyResult: null,
      resolvedType: null,
      fridgeResult: null,
      menuResult: null,
      foodResult: null,
      errorKind: null,
      errorMessage: null,
      step: 'camera',
    })
  },

  confirmType: (type) => {
    set({ resolvedType: type, step: 'processing' })
    get()._process(type)
  },

  setError: (kind, message) => {
    set({ step: 'error', errorKind: kind, errorMessage: message ?? null })
  },

  reset: () => {
    set({ ...INITIAL_STATE })
  },

  // ── Internal: classify image ──────────────────────────────────────────
  _classify: async () => {
    const { imageBlob, mode, isDemo } = get()
    if (!imageBlob) return

    set({ step: 'classifying' })

    if (isDemo) {
      set({ classifyResult: { type: 'fridge', confidence: 0.96 }, resolvedType: 'fridge', step: 'processing' })
      get()._process('fridge')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', imageBlob, 'scan.jpg')
      formData.append('mode', mode)

      const res = await fetch('/api/scan/classify', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`classify ${res.status}`)
      }

      const data: ClassifyResponse = await res.json()
      set({ classifyResult: data })

      // If mode is forced (not auto) or confidence is high enough, skip picker
      const CONFIDENCE_THRESHOLD = 0.75
      if (mode !== 'auto' || data.confidence >= CONFIDENCE_THRESHOLD) {
        const type = mode !== 'auto' ? (mode as ScanType) : data.type
        set({ resolvedType: type, step: 'processing' })
        get()._process(type)
      } else {
        // Low confidence — show mode picker
        set({ step: 'picking' })
      }
    } catch (err) {
      console.error('[scanStore] classify error:', err)
      get().setError('network', 'Failed to classify image')
    }
  },

  // ── Internal: process image for the resolved type ─────────────────────
  _process: async (type) => {
    const { imageBlob, isDemo } = get()
    if (!imageBlob) return

    set({ step: 'processing' })

    const endpoint = isDemo ? '/api/scan/demo' : `/api/scan/${type}`

    try {
      const formData = new FormData()
      formData.append('image', imageBlob, 'scan.jpg')

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (res.status === 429) {
        get().setError('rate_limited', 'You have reached your scan limit')
        return
      }

      if (!res.ok) {
        throw new Error(`${endpoint} ${res.status}`)
      }

      const data = await res.json()

      if (type === 'fridge') {
        get()._setFridgeResult(data)
      } else if (type === 'menu') {
        get()._setMenuResult(data)
      } else {
        get()._setFoodResult(data)
      }

      set({ step: 'results' })
    } catch (err) {
      console.error('[scanStore] process error:', err)
      get().setError('network', 'Failed to process image')
    }
  },

  _setFridgeResult: (result) => set({ fridgeResult: result }),
  _setMenuResult: (result) => set({ menuResult: result }),
  _setFoodResult: (result) => set({ foodResult: result }),
}))
