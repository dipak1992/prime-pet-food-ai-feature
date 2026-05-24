'use client'

import React from 'react'
import { Camera, Pencil, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  onReset?: () => void
  onEditIngredients?: () => void
  onBack?: () => void
}

interface State {
  hasError: boolean
  errorMessage: string
}

/**
 * SnapCookErrorBoundary
 * ─────────────────────
 * Wraps the Snap & Cook meal generation result area.
 * If any child component throws (e.g. undefined meal.meta, bad AI response),
 * this catches it and shows a premium recovery UI instead of a blank page.
 */
export class SnapCookErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'Unknown error',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; Sentry will pick this up in production via global-error
    console.error('[SnapCookErrorBoundary] Caught error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center space-y-4">
        <div>
          <span className="text-4xl block mb-3">😕</span>
          <h3 className="text-base font-bold text-red-900">
            Something went wrong while building your meal
          </h3>
          <p className="text-sm text-red-700 mt-1 max-w-xs mx-auto">
            We hit an unexpected issue. Your ingredients are safe — try one of the options below.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={this.handleReset}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          {this.props.onEditIngredients && (
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' })
                this.props.onEditIngredients?.()
              }}
              className="w-full gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Ingredients
            </Button>
          )}

          {this.props.onBack && (
            <Button
              variant="ghost"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' })
                this.props.onBack?.()
              }}
              className="w-full gap-2 text-muted-foreground"
            >
              <Camera className="h-4 w-4" />
              Back to Snap &amp; Cook
            </Button>
          )}
        </div>
      </div>
    )
  }
}
