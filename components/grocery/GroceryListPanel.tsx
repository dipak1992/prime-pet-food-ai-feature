'use client'

import { useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { useWeeklyPlanStore } from '@/lib/planner/store'
import { buildGroceryList } from '@/lib/planner/grocery'
import { CATEGORY_ORDER, GROCERY_ICONS } from '@/lib/planner/types'
import type { GroceryLine, StoreFormat } from '@/lib/planner/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ShoppingCart,
  CheckCheck,
  RotateCcw,
  Leaf,
  Store,
  Package,
  Trash2,
  X,
  Plus,
  Pencil,
  Check,
  StickyNote,
  Calendar,
  Utensils,
  ArrowRight,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ── Store format tab ──────────────────────────────────────────

const FORMAT_OPTIONS: Array<{ value: StoreFormat; label: string; icon: string }> = [
  { value: 'standard', label: 'Standard', icon: '🛒' },
  { value: 'walmart', label: 'Walmart', icon: '🏪' },
  { value: 'costco', label: 'Costco', icon: '📦' },
]

// ── Per-item row ──────────────────────────────────────────────

function GroceryItemRow({
  item,
  onToggleChecked,
  onTogglePantry,
  onDelete,
  onUpdate,
}: {
  item: GroceryLine
  onToggleChecked: (id: string) => void
  onTogglePantry: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<GroceryLine>) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editQty, setEditQty] = useState(String(item.quantity))
  const [editUnit, setEditUnit] = useState(item.unit)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(item.note ?? '')
  const nameRef = useRef<HTMLInputElement>(null)

  const qty = item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(2)

  function startEdit() {
    setEditName(item.name)
    setEditQty(String(item.quantity))
    setEditUnit(item.unit)
    setIsEditing(true)
    setTimeout(() => nameRef.current?.focus(), 0)
  }

  function saveEdit() {
    const parsedQty = parseFloat(editQty)
    if (editName.trim() && parsedQty > 0) {
      onUpdate(item.id, {
        name: editName.trim(),
        quantity: parsedQty,
        unit: editUnit.trim(),
      })
    }
    setIsEditing(false)
  }

  function saveNote() {
    onUpdate(item.id, { note: noteText.trim() || undefined })
    setShowNote(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-1 rounded-lg bg-muted/50">
        <input
          ref={nameRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 min-w-0 text-sm font-medium bg-transparent border-b border-primary/40 focus:border-primary outline-none px-1 py-0.5"
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          placeholder="Item name"
        />
        <input
          value={editQty}
          onChange={(e) => setEditQty(e.target.value)}
          className="w-14 text-sm bg-transparent border-b border-primary/40 focus:border-primary outline-none text-center px-1 py-0.5"
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          placeholder="Qty"
          type="number"
          step="any"
          min="0"
        />
        <input
          value={editUnit}
          onChange={(e) => setEditUnit(e.target.value)}
          className="w-16 text-sm bg-transparent border-b border-primary/40 focus:border-primary outline-none px-1 py-0.5"
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          placeholder="Unit"
        />
        <button type="button" onClick={saveEdit} className="p-1 text-emerald-600 hover:text-emerald-700">
          <Check className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <div
        className={cn(
          'flex items-start gap-3 py-2 px-1 rounded-lg transition-colors group',
          item.isChecked && 'opacity-50',
          item.isInPantry && 'bg-emerald-50/50',
        )}
      >
        {/* Checkbox */}
        <Checkbox
          id={item.id}
          checked={item.isChecked}
          onCheckedChange={() => onToggleChecked(item.id)}
          className="mt-0.5 flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <label
            htmlFor={item.id}
            className={cn(
              'text-sm font-medium cursor-pointer leading-snug flex items-center gap-1.5 flex-wrap',
              item.isChecked && 'line-through text-muted-foreground',
            )}
          >
            <span>{item.name}</span>

            {/* Custom badge */}
            {item.isCustom && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-violet-700 border-violet-300 bg-violet-50">
                custom
              </Badge>
            )}

            {/* Pantry badge */}
            {item.isInPantry && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-emerald-700 border-emerald-300 bg-emerald-50">
                <Leaf className="h-2.5 w-2.5 mr-0.5" />pantry
              </Badge>
            )}
          </label>

          {/* Quantity + unit */}
          <p className="text-xs text-muted-foreground mt-0.5">
            {qty} {item.unit}
            {item.walmartAisle && (
              <span className="ml-2 text-blue-600">{item.walmartAisle}</span>
            )}
            {item.costcoBulkNote && (
              <span className="ml-2 text-orange-600">{item.costcoBulkNote}</span>
            )}
          </p>

          {/* Note */}
          {item.note && (
            <p className="text-[11px] text-violet-600 mt-0.5 italic">📝 {item.note}</p>
          )}

          {/* From meals tooltip */}
          {item.fromMeals.length > 0 && (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              For: {item.fromMeals.join(', ')}
            </p>
          )}
        </div>

        {/* Cost */}
        {item.estimatedCost > 0 && (
          <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
            ~${item.estimatedCost.toFixed(2)}
          </span>
        )}

        {/* Action buttons — always visible on touch screens, hover-revealed on larger screens. */}
        <div className="flex flex-shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          {/* Edit */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={startEdit}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-primary sm:h-auto sm:w-auto sm:p-1"
              >
                <Pencil className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Edit item</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Note */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={() => setShowNote(!showNote)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md sm:h-auto sm:w-auto sm:p-1',
                  item.note ? 'text-violet-600' : 'text-muted-foreground hover:text-violet-600',
                )}
              >
                <StickyNote className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {item.note ? 'Edit note' : 'Add note'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Pantry toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={() => onTogglePantry(item.id)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md sm:h-auto sm:w-auto sm:p-1',
                  item.isInPantry
                    ? 'text-emerald-600'
                    : 'text-muted-foreground hover:text-emerald-600',
                )}
              >
                <Leaf className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {item.isInPantry ? 'Remove from pantry' : 'Mark as in pantry'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                type="button"
                onClick={() => onDelete(item.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-red-600 sm:h-auto sm:w-auto sm:p-1"
              >
                <X className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Remove item</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Note editor */}
      {showNote && (
        <div className="flex items-center gap-2 pl-9 pb-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="flex-1 text-xs bg-muted/50 border border-border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Add a note (e.g. buy organic)"
            onKeyDown={(e) => e.key === 'Enter' && saveNote()}
            autoFocus
          />
          <button type="button" onClick={saveNote} className="text-xs text-primary font-medium hover:underline">
            Save
          </button>
          <button type="button" onClick={() => setShowNote(false)} className="text-xs text-muted-foreground hover:underline">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ── Category section ──────────────────────────────────────────

function CategorySection({
  category,
  items,
  onCheckAll,
  onToggleChecked,
  onTogglePantry,
  onDelete,
  onUpdate,
}: {
  category: string
  items: GroceryLine[]
  onCheckAll: (category: string) => void
  onToggleChecked: (id: string) => void
  onTogglePantry: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<GroceryLine>) => void
}) {
  const icon = GROCERY_ICONS[category] ?? '🛒'
  const allChecked = items.every((i) => i.isChecked)
  const checkedCount = items.filter((i) => i.isChecked).length
  const pantryCount = items.filter((i) => i.isInPantry).length

  return (
    <div className="space-y-0.5">
      {/* Category header */}
      <div className="flex items-center justify-between py-1.5 border-b border-border/50 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-semibold text-sm capitalize">{category}</span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
            {checkedCount}/{items.length}
          </Badge>
          {pantryCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-emerald-700 border-emerald-300">
              {pantryCount} in pantry
            </Badge>
          )}
        </div>
        {!allChecked && (
          <button
            type="button"
            onClick={() => onCheckAll(category)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            check all
          </button>
        )}
      </div>

      {items.map((item) => (
        <GroceryItemRow
          key={item.id}
          item={item}
          onToggleChecked={onToggleChecked}
          onTogglePantry={onTogglePantry}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────

export function GroceryListPanel() {
  const {
    groceryList,
    plan,
    storeFormat,
    setStoreFormat,
    setGroceryList,
    togglePantryItem,
    toggleChecked,
    checkAllInCategory,
    uncheckAll,
    addCustomItem,
    deleteItem,
    updateItem,
    clearCheckedItems,
  } = useWeeklyPlanStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty] = useState('1')
  const [newUnit, setNewUnit] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [newNote, setNewNote] = useState('')

  function regenerateFromWeeklyPlan() {
    const meals = plan.days
      .filter((day) => day.meal)
      .map((day) => day.meal!)
    if (meals.length === 0) return
    const pantryNames = groceryList?.items.filter((item) => item.isInPantry).map((item) => item.name) ?? []
    setGroceryList(buildGroceryList(meals, pantryNames, storeFormat, plan.weekStart))
  }

  // Group items by category, sorted by CATEGORY_ORDER
  const grouped = useMemo(() => {
    if (!groceryList) return []
    const map = new Map<string, GroceryLine[]>()
    for (const item of groceryList.items) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return CATEGORY_ORDER
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: map.get(cat)! }))
      .concat(
        Array.from(map.entries())
          .filter(([cat]) => !CATEGORY_ORDER.includes(cat))
          .map(([cat, items]) => ({ category: cat, items })),
      )
  }, [groceryList])

  if (!groceryList) {
    const hasMeals = plan.days.some((day) => day.meal)
    return (
      <div className="space-y-4">
        {/* Empty state — actionable */}
        <div className="rounded-2xl border border-dashed border-border/60 bg-gradient-to-br from-orange-50/30 to-white dark:from-neutral-900/50 dark:to-neutral-950 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30 mx-auto mb-4">
            <ShoppingCart className="h-7 w-7 text-[#D97757]" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">No grocery list yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {hasMeals
              ? 'You have meals planned! Generate your grocery list to see all the ingredients you need.'
              : 'Plan your weekly meals first — your grocery list builds automatically from the recipes you choose.'}
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasMeals ? (
              <Button size="sm" onClick={regenerateFromWeeklyPlan} className="bg-[#D97757] hover:bg-[#c4684b] text-white">
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Generate Grocery List
              </Button>
            ) : (
              <Link href="/planner">
                <Button size="sm" className="bg-[#D97757] hover:bg-[#c4684b] text-white">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Generate Weekly Plan
                </Button>
              </Link>
            )}
            <Link href="/dashboard/tonight">
              <Button variant="outline" size="sm">
                <Utensils className="h-4 w-4 mr-1.5" />
                Plan Tonight&rsquo;s Dinner
              </Button>
            </Link>
          </div>

          {/* Tip */}
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            <span>Tip: You can also add items manually below</span>
          </div>
        </div>

        {/* Add custom item — accessible without a meal plan */}
        <div className="space-y-2">
          {!showAddForm ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add custom item
            </Button>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold">Add Custom Item</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Item name *"
                  className="col-span-2 text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
                <input
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="Qty"
                  type="number"
                  min="0"
                  step="any"
                  className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                />
                <input
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Unit (e.g. lbs)"
                  className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {CATEGORY_ORDER.map((cat) => (
                    <option key={cat} value={cat}>
                      {GROCERY_ICONS[cat] ?? '🛒'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewName('')
                    setNewQty('1')
                    setNewUnit('')
                    setNewCategory('other')
                    setNewNote('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!newName.trim()}
                  onClick={() => {
                    addCustomItem({
                      name: newName.trim(),
                      quantity: parseFloat(newQty) || 1,
                      unit: newUnit.trim() || 'unit',
                      category: newCategory,
                      note: newNote.trim() || undefined,
                    })
                    setNewName('')
                    setNewQty('1')
                    setNewUnit('')
                    setNewCategory('other')
                    setNewNote('')
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const totalItems = groceryList.items.length
  const checkedCount = groceryList.items.filter((i) => i.isChecked).length
  const pantryItems = groceryList.items.filter((i) => i.isInPantry)
  const toBuyItems = groceryList.items.filter((i) => !i.isInPantry)
  const toBuyCost = toBuyItems.reduce((sum, i) => sum + (i.isChecked ? 0 : i.estimatedCost), 0)
  const pantryValue = pantryItems.reduce((sum, i) => sum + i.estimatedCost, 0)
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Grocery List</h2>
            <Badge className="bg-primary/10 text-primary border-0 px-2 py-0.5 text-xs">
              {checkedCount}/{totalItems}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Week of {groceryList.weekStart} · {toBuyItems.length} items to buy
            {pantryItems.length > 0 && (
              <span className="text-emerald-700 ml-1">
                · {pantryItems.length} already in pantry
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerateFromWeeklyPlan}
            className="text-muted-foreground"
            disabled={!plan.days.some((day) => day.meal)}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={uncheckAll}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Uncheck all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              groceryList.items.forEach((i) => {
                if (!i.isChecked) checkAllInCategory(i.category)
              })
            }
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
            Check all
          </Button>
          {checkedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCheckedItems}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear checked ({checkedCount})
            </Button>
          )}
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Shopping progress</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-50">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {checkedCount}/{totalItems} checked · {toBuyItems.length} to buy
          </p>
        </div>
        <div className="rounded-xl bg-orange-50 px-3 py-2">
          <p className="text-[11px] font-semibold text-orange-700">Pantry deducted</p>
          <p className="text-lg font-bold text-slate-950">{pantryItems.length}</p>
          <p className="text-[11px] text-muted-foreground">~${pantryValue.toFixed(2)} saved</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2">
          <p className="text-[11px] font-semibold text-slate-600">Estimated cart</p>
          <p className="text-lg font-bold text-slate-950">
            ${toBuyCost > 0 ? toBuyCost.toFixed(2) : groceryList.totalEstimatedCost.toFixed(2)}
          </p>
          <p className="text-[11px] capitalize text-muted-foreground">{storeFormat} format</p>
        </div>
      </section>

      {/* ── Store format picker ── */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-muted w-fit">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStoreFormat(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              storeFormat === opt.value
                ? 'bg-white shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* ── Store format hints ── */}
      {storeFormat === 'walmart' && (
        <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-xl px-3 py-2">
          <Store className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Items organized by <strong>Walmart aisle</strong>. Aisle labels shown next to each item.</span>
        </div>
      )}
      {storeFormat === 'costco' && (
        <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 rounded-xl px-3 py-2">
          <Package className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Quantities adjusted for <strong>Costco bulk sizes</strong>. Bulk notes shown next to each item.</span>
        </div>
      )}

      {/* ── Category sections ── */}
      <div className="space-y-6">
        {grouped.map(({ category, items }) => (
          <CategorySection
            key={category}
            category={category}
            items={items}
            onCheckAll={checkAllInCategory}
            onToggleChecked={toggleChecked}
            onTogglePantry={togglePantryItem}
            onDelete={deleteItem}
            onUpdate={updateItem}
          />
        ))}
      </div>

      {/* ── Add custom item ── */}
      <div className="space-y-2">
        {!showAddForm ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add custom item
          </Button>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Add Custom Item</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Item name *"
                className="col-span-2 text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
                autoFocus
              />
              <input
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qty"
                type="number"
                min="0"
                step="any"
                className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
              />
              <input
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Unit (e.g. lbs)"
                className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {GROCERY_ICONS[cat] ?? '🛒'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Note (optional)"
                className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewName('')
                  setNewQty('1')
                  setNewUnit('')
                  setNewCategory('other')
                  setNewNote('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!newName.trim()}
                onClick={() => {
                  addCustomItem({
                    name: newName.trim(),
                    quantity: parseFloat(newQty) || 1,
                    unit: newUnit.trim() || 'unit',
                    category: newCategory,
                    note: newNote.trim() || undefined,
                  })
                  setNewName('')
                  setNewQty('1')
                  setNewUnit('')
                  setNewCategory('other')
                  setNewNote('')
                  // Keep form open for adding multiple items
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer cost summary ── */}
      <div className="border-t pt-4 mt-4 space-y-2">
        {pantryValue > 0 && (
          <div className="flex justify-between text-sm text-emerald-700">
            <span className="flex items-center gap-1.5">
              <Leaf className="h-4 w-4" />
              Pantry savings
            </span>
            <span>-${pantryValue.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <span>Estimated total</span>
          <span>${toBuyCost > 0 ? toBuyCost.toFixed(2) : groceryList.totalEstimatedCost.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Estimates based on average grocery prices. Actual costs may vary.
        </p>

        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-xs text-emerald-800">
          🛒 <strong>Retailer handoff ready</strong> — use the store cards above for Walmart, Instacart, Amazon Fresh, or Kroger where available. Your full list is copied as backup before the retailer opens.
        </div>

        {checkedCount === totalItems && totalItems > 0 && (
          <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-sm text-emerald-700 font-medium">
            🎉 You&rsquo;ve got everything! Time to cook.
          </div>
        )}
      </div>
    </div>
  )
}
