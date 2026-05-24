'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, FlipHorizontal, Zap, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/scan/compressImage'
import { hapticTap } from '@/lib/scan/haptics'
import type { ScanMode } from '@/lib/scan/types'

interface ScanCameraProps {
  mode: ScanMode
  onCapture: (blob: Blob, dataUrl: string) => void
  onModeChange: (mode: ScanMode) => void
  onError: (msg: string) => void
}

const MODE_LABELS: Record<ScanMode, string> = {
  auto: '✨ Auto',
  fridge: '🧊 Fridge',
  menu: '📋 Menu',
  food: '🍽️ Food',
}

export function ScanCamera({ mode, onCapture, onModeChange, onError }: ScanCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [torchOn, setTorchOn] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const startStream = useCallback(async () => {
    // Stop any existing stream
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCameraReady(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch (err: unknown) {
      const error = err as Error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        onError('camera_permission')
      } else {
        onError('unknown')
      }
    }
  }, [facingMode, onError])

  useEffect(() => {
    startStream()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [startStream])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady || capturing) return
    hapticTap()
    setCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (rawBlob) => {
      if (!rawBlob) {
        setCapturing(false)
        return
      }
      try {
        const compressed = await compressImage(rawBlob, { maxWidth: 1280, quality: 0.85 })
        const dataUrl = await blobToDataUrl(compressed)
        onCapture(compressed, dataUrl)
      } catch {
        onCapture(rawBlob, await blobToDataUrl(rawBlob))
      } finally {
        setCapturing(false)
      }
    }, 'image/jpeg', 0.95)
  }

  const handleFlip = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] })
      setTorchOn((v) => !v)
    } catch {
      // Torch not supported
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    hapticTap()
    try {
      const compressed = await compressImage(file, { maxWidth: 1280, quality: 0.85 })
      const dataUrl = await blobToDataUrl(compressed)
      onCapture(compressed, dataUrl)
    } catch {
      const dataUrl = await blobToDataUrl(file)
      onCapture(file, dataUrl)
    }
  }

  return (
    <div className="relative flex flex-col h-full bg-black">
      {/* Video feed */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
          aria-label="Camera viewfinder"
        />
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
          {/* Corner accents */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
            <div
              key={corner}
              className={cn(
                'absolute w-6 h-6 border-white border-2',
                corner === 'top-left' && 'top-8 left-8 border-r-0 border-b-0 rounded-tl-lg',
                corner === 'top-right' && 'top-8 right-8 border-l-0 border-b-0 rounded-tr-lg',
                corner === 'bottom-left' && 'bottom-8 left-8 border-r-0 border-t-0 rounded-bl-lg',
                corner === 'bottom-right' && 'bottom-8 right-8 border-l-0 border-t-0 rounded-br-lg'
              )}
            />
          ))}
        </div>

        {/* Top controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleTorch}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              torchOn ? 'bg-yellow-400 text-black' : 'bg-black/50 text-white'
            )}
            aria-label={torchOn ? 'Turn off flash' : 'Turn on flash'}
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={handleFlip}
            className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
            aria-label="Flip camera"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode pills */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 px-4">
        {(Object.keys(MODE_LABELS) as ScanMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { hapticTap(); onModeChange(m) }}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all',
              mode === m
                ? 'bg-[#D97757] text-white shadow-md'
                : 'bg-black/50 text-white/80 hover:bg-black/70'
            )}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Bottom controls */}
      <div className="bg-black px-6 py-6 flex items-center justify-between">
        {/* Upload from gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Upload from gallery"
        >
          <Upload className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Shutter button */}
        <motion.button
          onClick={handleCapture}
          disabled={!cameraReady || capturing}
          whileTap={{ scale: 0.92 }}
          className={cn(
            'w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-opacity',
            (!cameraReady || capturing) ? 'opacity-50' : 'opacity-100'
          )}
          aria-label="Take photo"
        >
          <div className={cn(
            'w-14 h-14 rounded-full transition-colors',
            capturing ? 'bg-white/60' : 'bg-white'
          )} />
        </motion.button>

        {/* Placeholder for symmetry */}
        <div className="w-12 h-12" />
      </div>
    </div>
  )
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
