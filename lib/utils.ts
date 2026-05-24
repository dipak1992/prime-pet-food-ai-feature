import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addDays, startOfWeek } from 'date-fns';
import type { LifeStage, Allergy, MedicalCondition, GroceryCategory } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date utilities ──────────────────────────────────────────
export function getWeekDates(startDate: Date = new Date()) {
  const monday = startOfWeek(startDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

// ── Family member colors ────────────────────────────────────
const MEMBER_COLORS = [
  '#3B82F6', '#E76F51', '#8B5CF6', '#F59E0B',
  '#10B981', '#EC4899', '#06B6D4', '#6366F1',
];

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export function getStageColor(stage: LifeStage): string {
  switch (stage) {
    case 'adult': return '#3B82F6';
    case 'baby': return '#8B5CF6';
    case 'toddler': return '#F59E0B';
    case 'kid': return '#10B981';
  }
}

export function getStageBgClass(stage: LifeStage): string {
  switch (stage) {
    case 'adult': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'baby': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'toddler': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'kid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

export function getStageEmoji(stage: LifeStage): string {
  switch (stage) {
    case 'adult': return '👤';
    case 'baby': return '👶';
    case 'toddler': return '🧒';
    case 'kid': return '👦';
  }
}

export function stageLabelDisplay(stage: LifeStage, age?: number | null): string {
  switch (stage) {
    case 'adult': return 'Adult';
    case 'baby': return age ? `Baby (${age}mo)` : 'Baby';
    case 'toddler': return age ? `Toddler (${age}yr)` : 'Toddler';
    case 'kid': return age ? `Kid (${age}yr)` : 'Kid';
  }
}

// ── Allergy / Condition labels ──────────────────────────────
export const ALLERGY_LABELS: Record<Allergy, string> = {
  peanuts: 'Peanuts',
  tree_nuts: 'Tree Nuts',
  milk: 'Milk/Dairy',
  eggs: 'Eggs',
  wheat: 'Wheat/Gluten',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
  honey: 'Honey',
};

export const CONDITION_LABELS: Record<MedicalCondition, string> = {
  diabetes: 'Diabetes',
  prediabetes: 'Pre-Diabetes',
  hypertension: 'Hypertension',
  pcos: 'PCOS',
  ibs: 'IBS',
  gerd: 'GERD / Acid Reflux',
  celiac: 'Celiac Disease',
  lactose_intolerance: 'Lactose Intolerance',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  postpartum: 'Postpartum Support',
  iron_deficiency: 'Iron Deficiency',
  high_cholesterol: 'High Cholesterol',
  kidney_disease: 'Kidney Disease',
};

export const GROCERY_CATEGORY_ICONS: Record<GroceryCategory, string> = {
  produce: '🥦',
  protein: '🥩',
  dairy: '🥛',
  grains: '🌾',
  pantry: '🫙',
  frozen: '🧊',
  beverages: '🧃',
  spices: '🌿',
  condiments: '🫚',
  snacks: '🍿',
  baby: '🍼',
  other: '🛒',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '…';
}

export function canUsePantryScanning(tier: string): boolean {
  return tier === 'plus' || tier === 'pro';
}

export function canUseMedicalAware(tier: string): boolean {
  return tier === 'plus' || tier === 'pro';
}

export function getMaxFamilyMembers(tier: string): number {
  switch (tier) {
    case 'free': return 3;
    case 'plus': return 8;
    case 'pro': return 20;
    default: return 3;
  }
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Re-export date-fns format for use across the app
export { format, addDays, startOfWeek };
