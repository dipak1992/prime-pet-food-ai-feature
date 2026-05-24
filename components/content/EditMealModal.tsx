'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { SavedMealSummary } from '@/lib/content/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface EditMealModalProps {
  meal: SavedMealSummary
  open: boolean
  onClose: () => void
  onSaved: (updated: Partial<SavedMealSummary>) => void
}

export function EditMealModal({ meal, open, onClose, onSaved }: EditMealModalProps) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: meal.title,
      description: meal.description ?? '',
      is_public: meal.is_public,
    },
  })

  const isPublic = watch('is_public')

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const res = await fetch(`/api/content/meals/${meal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          is_public: values.is_public,
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Saved!')
      onSaved({
        title: values.title,
        description: values.description || null,
        is_public: values.is_public,
      })
      onClose()
    } catch {
      toast.error('Couldn\'t save changes — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit meal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" {...register('title')} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">
              Description{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="edit-desc"
              rows={3}
              placeholder="Briefly describe this meal…"
              {...register('description')}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Make public</p>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view
              </p>
            </div>
            <Switch
              id="edit-public"
              checked={isPublic}
              onCheckedChange={(val) => setValue('is_public', val)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
