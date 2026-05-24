'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ProPaywallCard } from '@/components/paywall/ProPaywallCard'

interface PaywallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  isAuthenticated: boolean
  redirectPath?: string
}

export function PaywallDialog({
  open,
  onOpenChange,
  title,
  description,
  isAuthenticated,
  redirectPath,
}: PaywallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-0 bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ProPaywallCard
          title={title}
          description={description}
          isAuthenticated={isAuthenticated}
          redirectPath={redirectPath}
        />
      </DialogContent>
    </Dialog>
  )
}
