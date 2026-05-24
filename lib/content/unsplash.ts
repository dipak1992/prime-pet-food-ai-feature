/**
 * Shared Unsplash image helper used by blog.ts and blog-posts-batch2.ts.
 * Extracted here to avoid circular imports between the two blog data files.
 *
 * Each keyword string maps to a hand-picked, verified Unsplash photo ID.
 * To swap an image: replace the ID value — URL structure stays the same.
 */

const FOOD_PHOTOS: Record<string, string> = {
  'family,dinner,table,weeknight':    '1547592180-85f173990554', // family at dinner table ✓
  'toddler,eating,dinner,highchair':  '1565299624946-b28f40a0ae38', // colourful plated meal ✓
  'healthy,dinner,herbs,lemon':       '1512621776951-a57141f2eefd', // fresh healthy plate ✓
  'baby,led,weaning,vegetables':      '1606923829579-0cb855f1e1b5', // baby finger foods ✓ (unique)
  'tired,parent,kitchen,dinner':      '1504674900247-0877df9cc836', // simple kitchen meal ✓
  'kitchen,phone,dinner,decision':    '1556909114-f6e7ad7d3136',   // modern kitchen ✓
  'toast,eggs,simple,dinner':         '1525351484163-7529414344d8', // eggs & toast ✓
  'one,pan,dinner,stove':             '1555939594-58d7cb561ad1',   // roasted skillet ✓
  'open,fridge,ingredients':          '1490645935967-10de6ba17061', // pantry / fridge ✓
  'toddler,crying,dinner,kitchen':    '1515516969-d4008cc6241a',   // toddler at table ✓ (unique)
  'charcuterie,board,snack,dinner':   '1467003909585-2f8a72700288', // assembled board ✓
  'phone,recipe,search,kitchen':      '1498837167922-ddd27525d352', // food table casual ✓
  'quick,pasta,family,dinner':        '1551183053-bf91a1d81141',   // pasta bowl ✓
  'sheet,pan,chicken,vegetables':     '1598515214211-89a3e7298f02', // sheet pan chicken ✓ (unique)
  'pasta,simple,ingredients,kitchen': '1621996346565-e3dbc646d9a9', // simple pasta prep ✓ (unique)
  'sheet,pan,sausage,potatoes':       '1600891964599-f94d5e4d0e77', // sausage sheet pan ✓ (unique)
  'pasta,family,bowl,weeknight':      '1513104890138-7c749659a591', // noodle bowl ✓
  'ground,beef,skillet,dinner':       '1574484284002-952d92456975', // ground beef skillet ✓ (unique)
  'chicken,thigh,skillet,dinner':     '1532550907401-a500c9a57435', // seared chicken ✓
  'cold,pasta,salad,summer':          '1505253716362-afaea1d3d1af', // cold pasta salad ✓ (unique)
  'air,fryer,chicken,dinner':         '1626645738196-c2a7c87a8f58', // crispy air fryer ✓ (unique)
  'sheet,pan,dinner,simple':          '1567620905862-fe2e4f2e77c5', // simple roasted vegs ✓ (unique)
}

const FALLBACK_ID = '1547592180-85f173990554'

export const UNSPLASH = (keywords: string, _lock = 1) => {
  const id = FOOD_PHOTOS[keywords] ?? FALLBACK_ID
  return `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`
}
