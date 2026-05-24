'use client'

import { useState, type ComponentType } from 'react'
import { Camera } from 'lucide-react'

/**
 * Landing page scan demo button.
 * Performance: does NOT eagerly import the scan store or ScanModal.
 * Both are loaded on-demand only when the user clicks.
 */
export function LandingScanDemoButton() {
  const [ScanModal, setScanModal] = useState<ComponentType | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = async () => {
    if (!ScanModal) {
      // Lazy-load both the store and modal only on interaction
      const [storeModule, modalModule] = await Promise.all([
        import('@/stores/scanStore'),
        import('@/components/scan/ScanModal'),
      ])
      setScanModal(() => modalModule.ScanModal)
      storeModule.useScanStore.getState().openDemo()
    } else {
      // Store already loaded, just open
      const { useScanStore } = await import('@/stores/scanStore')
      useScanStore.getState().openDemo()
    }
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex min-h-[48px] w-[88%] items-center justify-center gap-2 rounded-full border border-[#D97757]/30 bg-white/82 px-6 text-base font-semibold text-[#B75F40] shadow-sm backdrop-blur transition hover:bg-orange-50 sm:w-auto"
      >
        <Camera className="h-4 w-4" />
        Try the scanner
      </button>
      {ScanModal && isOpen ? <ScanModal /> : null}
    </>
  )
}
