'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  locked?: boolean
}

// Web Speech API type declarations (not in all TS lib versions)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

interface ISpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor
    webkitSpeechRecognition?: ISpeechRecognitionConstructor
  }
}

/**
 * Voice input component using Web Speech API.
 * Shows a microphone button that toggles recording.
 * On speech end, sends the transcript as a message.
 * Gracefully hidden if not supported.
 */
export function VoiceInput({ onTranscript, disabled = false, locked = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognitionCtor) {
      setIsSupported(true)
      const recognition = new SpeechRecognitionCtor()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript?.trim()) {
          onTranscript(transcript.trim())
        }
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleListening = useCallback(() => {
    if (locked) {
      onTranscript('')
      return
    }
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening, locked, onTranscript])

  // Don't render if not supported
  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled && !locked}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
        locked
          ? 'bg-amber-100 text-amber-700'
          :
        isListening
          ? 'bg-red-100 text-red-600 shadow-md'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      aria-label={locked ? 'Voice Copilot requires Plus' : isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? (
        <>
          {/* Pulsing indicator */}
          <span className="absolute inset-0 animate-ping rounded-full bg-red-200 opacity-40" />
          <MicOff size={16} className="relative z-10" />
        </>
      ) : (
        <Mic size={16} />
      )}
    </button>
  )
}
