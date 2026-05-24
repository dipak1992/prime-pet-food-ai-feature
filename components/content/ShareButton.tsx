'use client'

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  slug: string
  type: 'meal' | 'plan'
  basePath?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  className?: string
}

export function ShareButton({
  slug,
  type,
  basePath = 'share',
  variant = 'outline',
  size = 'sm',
  className,
}: ShareButtonProps) {
  function handleCopy() {
    const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, '')
    const url = `${window.location.origin}/${normalizedBasePath}/${type}/${slug}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied!', { description: url }),
      () => toast.info('Share this link', { description: url }),
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
    >
      <Share2 className="h-3.5 w-3.5" />
      {size !== 'icon' && 'Share'}
    </Button>
  )
}
